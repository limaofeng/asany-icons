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
  let options: any = { combinePath: true }; //program.setting.get('ie').import;
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
    '<svg width="1em" height="1em" viewbox="0 0 ${unitsPerEm} ${unitsPerEm}" fill="currentColor">' +
    '<g transform="scale(1, -1) translate(0, -${translateY})"><path fillOpacity=".8" ${d}/></g>' +
    '</svg>';

  const getGlyfHTML = (glyf: any, ttf: any, opt: any) => {
    let g: any = {
      index: opt.index,
      compound: glyf.compound ? 'compound' : '',
      selected: opt.selected ? 'selected' : '',
      editing: opt.editing ? 'editing' : '',
      modify: glyf.modify,
      unitsPerEm: opt.unitsPerEm,
      translateY: opt.unitsPerEm + opt.descent,
      unicode: (glyf.unicode || [])
        .map(function(u: any) {
          return '$' + u.toString(16).toUpperCase();
        })
        .join(','),
      name: string.encodeHTML(glyf.name || ''),
      fillColor: opt.color ? 'style="fill:' + opt.color + '"' : '',
    };

    console.log(glyf.name);

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

      const iconObjects: { content: any; name: any }[] = [];

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
          iconObjects.push({ content: glyfStr, name: glyf.name });
          return glyfStr;
        });

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
        style={{ width: 100, overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: state.join('') }}
      />
    </div>
  );
};
