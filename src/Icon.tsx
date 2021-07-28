import React, { ComponentType } from 'react';
import { upperFirst } from 'lodash-es';
import { useIcon } from './store/hook/useIcon';
import classnames from 'classnames';

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
  let { name, onClick, className, style } = props;
  const svg = useIcon(name);
  return (
    <span
      onClick={onClick}
      role="img"
      aria-label={name}
      style={style}
      className={classnames(className, `anticon ${name}`)}
      dangerouslySetInnerHTML={{
        __html: svg!,
      }}
    />
  );
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
