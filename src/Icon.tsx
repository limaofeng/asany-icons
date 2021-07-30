import classnames from 'classnames';
import React, { CSSProperties } from 'react';

import { useIcon } from './hook/useIcon';

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

export default Icon;
