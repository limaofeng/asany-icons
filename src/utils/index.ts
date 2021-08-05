import font from 'fonteditor-core/lib/ttf/font';
import glyf2svg from 'fonteditor-core/lib/ttf/util/glyf2svg';
import string from 'fonteditor-core/lib/common/string';

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

const GLYF_ITEM_TPL =
  '<svg width="${width}" height="1em" viewbox="0 0 ${viewboxWidth} ${viewboxHeight}" fill="currentColor">' +
  '<g transform="scale(1, -1) translate(${translateX}, -${translateY})"><path fill-opacity=".8" ${d}/></g>' +
  '</svg>';

const getGlyfHTML = (glyf: any, ttf: any, opt: any) => {
  let width = '1em';
  let viewboxWidth = Math.floor(Math.max(glyf.xMax + glyf.xMin / 2, opt.unitsPerEm));
  const viewboxHeight = Math.max(glyf.yMax + glyf.yMin, opt.unitsPerEm);

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
  };

  let d = '';
  if ((d = glyf2svg(glyf, ttf))) {
    g.d = 'd="' + d + '"';
  }

  return string.format(GLYF_ITEM_TPL, g);
};

export const parseFiles = async (file: File) => {
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
    // console.log(
    //   'contours is null',
    //   ttf.glyf.filter((glyf: any) => !glyf.contours)
    // );
    // console.log(
    //   'unicode < 10000',
    //   ttf.glyf.filter((glyf: any) => (glyf.unicode || []).reduce((l: number, r: number) => l + r, 0) < 10000)
    // );
    const icons = ttf.glyf
      .filter((glyf: any) => !!glyf.contours)
      .filter(
        (glyf: any) => (glyf.unicode || []).reduce((l: number, r: number) => l + r, 0) > 10000 && glyf.contours.length
      )
      .map(function(glyf: any, i: number) {
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
        return {
          content: glyfStr,
          unicode: (glyf.unicode || [])
            .map(function(u: any) {
              return '$' + u.toString(16).toUpperCase();
            })
            .join(','),
          tags,
          name: glyf.name,
        };
      });
    console.log('解析', file.name, '发现', icons.length, '个图标');
    return icons;
  } catch (exp) {
    console.error(exp.message);
    throw exp;
  }
};

export const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, time);
  });
