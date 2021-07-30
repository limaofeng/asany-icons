import classnames from 'classnames';
import React, { ComponentType, CSSProperties } from 'react';

import { useIcon } from './hook/useIcon';

interface SortType {
  id: string;
  name: string;
}

export interface IconProps {
  name: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
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

Icon.register = (key: string, icon: ComponentType<any>, _?: SortType) => {
  console.warn('key:', key, 'icon:', icon);
};

export default Icon;
