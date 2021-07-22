import React, { ComponentType } from 'react';
import { upperFirst } from 'lodash-es';

export enum IconThemeType {
  Line = 'Line',
  Solid = 'Solid',
}
interface SortType {
  id: string;
  name: string;
}

const allIcons: {
  [key: string]: any;
} = {};

export interface IconProps {
  name: string;
  theme?: IconThemeType;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: object;
  type?: string;
}

function Icon(props: IconProps) {
  let { name, theme = 'Line', onClick, className, style, type } = props;
  if (type) {
    name = type;
  }
  if (!name) {
    return null;
  }
  let fullname = upperFirst(name);
  if (!fullname.endsWith(theme) || allIcons[fullname + theme]) {
    fullname += theme;
  }
  const icon = allIcons[name] || allIcons[fullname];
  if (!icon) {
    return null;
  }
  return React.createElement(icon, { className, onClick, style: { ...style } });
}

export const renderIcon = (id: string) => {
  return Icon({ name: id });
};

Icon.register = (key: string, icon: ComponentType<any>, _?: SortType) => {
  allIcons[key] = icon;
  if (key.startsWith('global')) {
    allIcons[key.substr(7)] = icon;
  }
  //   if (sort) {
  //     let found = false;
  //     for (let i = 0; i < categories.length; i++) {
  //       if (categories[i].id === sort.id) {
  //         found = true;
  //         categories[i].icons.push(key);
  //         break;
  //       }
  //     }
  //     if (!found) {
  //       categories.push({ ...sort, icons: [key] });
  //     }
  //   }
  // };
};

export default Icon;
