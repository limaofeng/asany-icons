import font from 'fonteditor-core/lib/ttf/font';
import glyf2svg from 'fonteditor-core/lib/ttf/util/glyf2svg';
import string from 'fonteditor-core/lib/common/string';

import { ParseIconFileError } from '../../types';
import inflate from '../inflate';

function svg2ttf(buffer: any): any {
  const options: any = { combinePath: true, type: 'svg' };
  return font.create(buffer, options).data;
}

function loadSVGFile(file: any, options: IconParseOptions) {
  let fileReader = new FileReader();
  let fName = options.filename;
  const retVal = new Promise((resolve, reject) => {
    fileReader.onload = function(e: any) {
      let buffer = e.target.result;
      try {
        let imported = svg2ttf(buffer);
        // 设置单个字形名字
        if (imported.glyf && imported.glyf.length === 1) {
          if (options.type === 'svg' && options.naturo) {
            return reject({ data: buffer });
          }
          imported.glyf[0].name = fName;
        }
        resolve(imported);
      } catch (exp) {
        if (options.type === 'svg' && options.naturo) {
          reject({ err: exp, data: buffer });
        } else {
          reject(exp);
        }
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
    options.inflate = inflate.inflate;
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
  // eslint-disable-next-line no-template-curly-in-string
  '<svg width="1em" height="1em" viewbox="0 0 ${viewboxWidth} ${viewboxHeight}" fill="currentColor"><g transform="scale(${scale}, -${scale}) translate(${translateX}, -${translateY})"><path fill-opacity=".8" ${d}/></g></svg>';

const getGlyfHTML = (glyf: any, ttf: any, opt: any) => {
  let viewboxWidth = Math.floor(glyf.xMax + glyf.xMin / 2); // Math.floor(Math.max(glyf.xMax + glyf.xMin / 2, opt.unitsPerEm));
  const viewboxHeight = Math.max(glyf.yMax + glyf.yMin, opt.unitsPerEm);
  const ratio = 1024 / opt.unitsPerEm;
  let g: any = {
    index: opt.index,
    compound: glyf.compound ? 'compound' : '',
    selected: opt.selected ? 'selected' : '',
    editing: opt.editing ? 'editing' : '',
    modify: glyf.modify,
    scale: ratio,
    viewboxWidth: viewboxWidth * ratio,
    viewboxHeight: viewboxHeight * ratio,
    unitsPerEm: opt.unitsPerEm,
    translateX: 0, // Math.floor((viewboxWidth - (glyf.xMax + glyf.xMin / 2)) / 2),
    translateY: viewboxHeight + (opt.descent || 0),
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

type IconParseOptions = {
  type?: 'svg' | 'ttf';
  naturo: boolean;
  filename?: string;
};

/**
 * 支持 svg / ttf / woff 文件
 * @param file
 * @returns
 */
export const parseIconFile = async (file: File, options: IconParseOptions = { naturo: false }) => {
  const type = (/\.([^.]+)$/.exec(file.name) || [])[1];
  let fName = file.name.replace(/\.\w+$/, '');
  options.type = type as any;
  options.filename = fName;
  let ttf: any;
  try {
    if ('svg' === type) {
      options.naturo = true;
      ttf = await loadSVGFile(file, options);
    } else {
      ttf = await loadTTFFile(file, options);
    }
    let unitsPerEm = ttf.head.unitsPerEm;
    let descent = ttf.hhea.descent;
    const icons = ttf.glyf
      .filter((glyf: any) => !!glyf.contours)
      .filter((glyf: any) => glyf.contours.length)
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
  } catch (error) {
    const data = (error as ParseIconFileError).data;
    if (!data) {
      throw error;
    }
    return [
      {
        content: data.replace(/<svg[^>]*>/gi, (data: string) => data.replace(/(width|height)="((.*?))"/gi, '$1="1em"')),
        name: fName,
        tags: [],
      },
    ];
  }
};

export const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, time);
  });
