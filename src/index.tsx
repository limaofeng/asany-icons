import React, { useState } from 'react';
import inflate from 'inflate';

import font from 'fonteditor-core/lib/ttf/font';
import glyf2svg from 'fonteditor-core/lib/ttf/util/glyf2svg';
import string from 'fonteditor-core/lib/common/string';

// Delete me
export const Thing = () => {
  const GLYF_ITEM_TPL =
    '<div data-index="${index}" class="glyf-item ${compound} ${modify} ${selected} ${editing}">' +
    '<i data-action="edit" class="ico i-edit" title="' +
    'xxx' +
    '"></i>' +
    '<i data-action="del" class="ico i-del" title="' +
    'xx' +
    '"></i>' +
    '<svg class="glyf" viewbox="0 0 ${unitsPerEm} ${unitsPerEm}">' +
    '<g transform="scale(1, -1) translate(0, -${translateY}) scale(0.9, 0.9) ">' +
    '<path class="path" ${fillColor} ${d}/></g>' +
    '</svg>' +
    '<div data-field="unicode" class="unicode" title="${unicode}">${unicode}</div>' +
    '<div data-field="name" class="name" title="${name}">${name}</div>' +
    '</div>';

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

    let d = '';
    if ((d = glyf2svg(glyf, ttf))) {
      g.d = 'd="' + d + '"';
    }

    return string.format(GLYF_ITEM_TPL, g);
  };

  function readttf(buffer: any, options: any) {
    if (options.type === 'woff') {
      options.inflate = inflate.inflate;
    }
    let ttf = font.create(buffer, options).data;
    delete options.inflate;

    return ttf;
  }

  const [state, setState] = useState([]);

  const handleFile = (e: any) => {
    console.log('files', e.target.files);
    const file = e.target.files[0];
    const options = {
      type: 'ttf',
    };
    let fileReader = new FileReader();
    fileReader.onload = function(e: any) {
      try {
        const ttf = readttf(e.target.result, options);
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
            return glyfStr;
          });
        setState(_icons);
      } catch (exp) {
        alert(exp.message);
        throw exp;
      }
    };
    fileReader.onerror = function(e) {
      console.error(e);
    };
    fileReader.readAsArrayBuffer(file);
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
