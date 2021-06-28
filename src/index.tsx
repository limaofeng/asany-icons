import React, { useState } from 'react';
// import inflate from 'inflate';

import font from 'fonteditor-core/lib/ttf/font';
import glyf2svg from 'fonteditor-core/lib/ttf/util/glyf2svg';
import string from 'fonteditor-core/lib/common/string';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

export { default as IconPicker } from './IconPicker';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

console.log('client', client);
// console.log('client', client);

export default {
  config: () => {},
};

function svg2ttf(buffer: any) {
  let options: any = { combinePath: false }; //program.setting.get('ie').import;
  options.type = 'svg';
  return font.create(buffer, options).data;
}

function loadSVGFile(file: any, _: any) {
  let fileReader = new FileReader();
  let fName = file.name.replace(/\.\w+$/, '');
  const retVal = new Promise((resolve, reject) => {
    fileReader.onload = function(e: any) {
      try {
        let buffer = e.target.result;
        let imported = svg2ttf(buffer);
        // 设置单个字形名字
        if (imported.glyf && imported.glyf.length === 1) {
          imported.glyf[0].name = fName;
        }
        resolve(imported);
        // options.success && options.success(imported);
      } catch (exp) {
        alert(exp.message);
        reject(e);
      }
    };

    fileReader.onerror = function(e) {
      console.error(e);
      reject(e);
    };
  });
  fileReader.readAsText(file);
  return retVal;
}

function readttf(buffer: any, options: any) {
  if (options.type === 'woff') {
    // options.inflate = inflate.inflate;
  }
  let ttf = font.create(buffer, options).data;
  delete options.inflate;

  return ttf;
}

function loadTTFFile(file: any, option: any) {
  let fileReader = new FileReader();
  const retVal = new Promise((resolve, reject) => {
    fileReader.onload = function(e: any) {
      const ttf = e.target.result;
      resolve(readttf(ttf, option));
    };
    fileReader.onerror = function(e) {
      console.error(e);
      reject(e);
    };
  });
  fileReader.readAsArrayBuffer(file);
  return retVal;
}

// Delete me
export const Thing = () => {
  const GLYF_ITEM_TPL =
    '<svg width="${width}" height="1em" viewbox="0 0 ${viewboxWidth} ${viewboxHeight}" fill="currentColor">' +
    '<g transform="scale(1, -1) translate(${translateX}, -${translateY})"><path fillOpacity=".8" ${d}/></g>' +
    '</svg>';

  const getGlyfHTML = (glyf: any, ttf: any, opt: any) => {
    let width = '1em';
    let viewboxWidth = Math.floor(
      Math.max(glyf.xMax + glyf.xMin / 2, opt.unitsPerEm)
    );
    const viewboxHeight = Math.max(glyf.yMax + glyf.yMin, opt.unitsPerEm);

    /*     if (viewboxWidth > opt.unitsPerEm) {
      if (viewboxWidth - opt.unitsPerEm < opt.unitsPerEm / 5) {
        // viewboxWidth = opt.unitsPerEm;
      } else {
        width = '2em';
      }
    } */

    let g: any = {
      index: opt.index,
      compound: glyf.compound ? 'compound' : '',
      selected: opt.selected ? 'selected' : '',
      editing: opt.editing ? 'editing' : '',
      modify: glyf.modify,
      width,
      viewboxWidth,
      viewboxHeight,
      unitsPerEm: opt.unitsPerEm,
      translateX: 0, //(1024 - width) / 2,
      translateY: viewboxHeight + opt.descent,
      unicode: (glyf.unicode || [])
        .map(function(u: any) {
          return '$' + u.toString(16).toUpperCase();
        })
        .join(','),
      name: string.encodeHTML(glyf.name || ''),
      // fillColor: opt.color ? 'style="fill:' + opt.color + '"' : '',
    };

    /*    if (viewboxWidth > 1024 || viewboxHeight > 1024) {
      console.log(
        'xxxx',
        g.unicode,
        viewboxWidth,
        viewboxHeight,
        glyf.xMax,
        glyf.yMax,
        glyf.xMin,
        glyf.yMin
      );
    } */

    // if (glyf.name == 'stripe') {
    //   console.log(glyf, glyf.name);
    //   console.log(glyf2svg(glyf, ttf));
    // }

    let d = '';
    if ((d = glyf2svg(glyf, ttf))) {
      g.d = 'd="' + d + '"';
    }

    return string.format(GLYF_ITEM_TPL, g);
  };

  const [state, setState] = useState([]);

  const handleFile = async (e: any) => {
    console.log('files', e.target.files);
    const file = e.target.files[0];
    console.log(file.name);
    const type = (/\.([^\.]+)$/.exec(file.name) || [])[1];
    const options = {
      type,
    };

    let ttf: any;

    if ('svg' === type) {
      ttf = await loadSVGFile(file, options);
    } else {
      ttf = await loadTTFFile(file, options);
    }

    try {
      let glyfTotal = ttf.glyf.length;
      console.log('glyfTotal', glyfTotal);
      let unitsPerEm = ttf.head.unitsPerEm;
      let descent = ttf.hhea.descent;

      console.log(
        ttf.glyf.filter(
          (glyf: any) =>
            (glyf.unicode || []).reduce((l: number, r: number) => l + r, 0) <
              10000 || glyf.contours.length == 0
        )
      );

      const iconObjects: {
        content: any;
        name: any;
        unicode: any;
        tags: string[];
      }[] = [];

      const _icons = ttf.glyf
        .filter(
          (glyf: any) =>
            (glyf.unicode || []).reduce((l: number, r: number) => l + r, 0) >
              10000 && glyf.contours.length
        )
        .map(function(glyf: any, i: number) {
          // console.log(glyf, glyf.unicode);
          let index = i;
          const glyfStr = getGlyfHTML(glyf, ttf, {
            index: index,
            unitsPerEm: unitsPerEm,
            descent: descent,
            selected: false,
            editing: false,
            color: '#000',
          });
          const tags: string[] = [];

          if (glyf.name) {
            const codes =
              'au,fj,nc,nz,pg,sb,vu,ar,bo,br,bs,bz,ca,cl,co,cr,cu,do,ec,fk,gf,gt,gy,hn,ht,jm,mx,ni,pa,pe,pr,py,sr,sv,tt,uy,ve,mt,ad,li,lu,sj,lt,lv,ee,ru,gl,no,se,fi,cy,xk,rs,hr,ba,me,mk,by,si,hu,md,ro,al,bg,sk,cz,ua,tr,gr,dk,at,nl,be,ch,pl,pt,es,it,fr,de,ie,is,uk,bb,dm,gd,gp,mq,pm,vc,lc,tc,aq,tf,hm,gs,fo,ge,am,az,ao,bf,bw,cd,cf,cg,ci,cm,dz,eg,et,ga,gn,iq,ir,jo,ke,ly,ma,mg,ml,mr,mw,mz,na,ne,ng,sa,sd,sn,so,ss,td,tn,tz,za,zm,zw,ph,id,my,bn,tl,th,kh,vn,la,jp,tw,kr,kp,bd,bt,np,lk,in,mn,tj,kg,pk,af,tm,uz,kz,cn,il,ps,lb,kw,bh,qa,om,ye,ae,rw,re,cv,gq,dj,bi,sz,ls,eh,er,ug,gw,gm,sl,lr,gh,tg,bj,mm,sy,st,mc,sm,sg,vg,vi,bl,ai,cw,bq,aw,sx,ms,mf,ky,kn,bm,ar-alt,bv,pn,pf,nu,pw,fm,tk,nr,ck,ki,to,tv,mp,wf,nf,cc,gu,cx,as,ws,pt-alt,es-alt,gi,va,hk,ie-alt,sh-tc,sh-ai,sh-sh,sc,mv,mu,io,mo,mh,km,je,im,gg,yt,ag';
            if (
              glyf.name == 'wrld' ||
              glyf.name.startsWith('wrld-') ||
              glyf.name.startsWith('glb-')
            ) {
              tags.push('地图/世界');
            } else if (glyf.name == 'ca' || glyf.name.startsWith('ca-')) {
              tags.push('地图/国家/加拿大');
            } else if (glyf.name == 'au' || glyf.name.startsWith('au-')) {
              tags.push('地图/国家/澳大利亚');
            } else if (glyf.name == 'uk' || glyf.name.startsWith('uk-')) {
              tags.push('地图/国家/英国');
            } else if (glyf.name == 'us' || glyf.name.startsWith('us-')) {
              tags.push('地图/国家/美国');
            } else if (codes.indexOf(glyf.name) > -1) {
              tags.push('地图/国家');
            } else {
              tags.push('其他');
            }
          }

          iconObjects.push({
            content: glyfStr,
            unicode: (glyf.unicode || [])
              .map(function(u: any) {
                return '$' + u.toString(16).toUpperCase();
              })
              .join(','),
            tags,
            name: glyf.name,
          });
          return glyfStr;
        });

      // console.log(client, gql);
      const options = {
        mutation: gql`
          mutation($icons: [IconInput]!) {
            importIcons(library: "1", icons: $icons) {
              id
              name
            }
          }
        `,
        variables: {
          icons: iconObjects,
        },
      };

      client.mutate(options);

      setState(_icons);
    } catch (exp) {
      alert(exp.message);
      throw exp;
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFile} />
      <div
        style={{ width: '100%', overflow: 'auto', padding: '10px' }}
        dangerouslySetInnerHTML={{ __html: state.join('') }}
      />
    </div>
  );
};
