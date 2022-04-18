import React, { CSSProperties, HTMLAttributes } from 'react';

import classnames from 'classnames';

import { useIcon } from './hook/useIcon';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
  container?: React.ComponentType<any>;
}

export interface IconContainerProps {
  svg: string;
}

const DefaultIconContainer = React.forwardRef((props: any, ref: any) => {
  let { className, svg, ...otherProps } = props;
  return (
    <span
      {...otherProps}
      ref={ref}
      dangerouslySetInnerHTML={{
        __html: svg!,
      }}
      className={classnames(className, `svg-icon`)}
    />
  );
});

function Icon(props: IconProps, ref: any) {
  let { name, onClick, className, style, container = DefaultIconContainer, ...otherProps } = props;
  const svg = useIcon(name);
  return React.createElement(container, {
    ...otherProps,
    ref,
    onClick,
    svg,
    style,
    className,
  });
}

export default React.forwardRef(Icon);
