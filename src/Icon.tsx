import React, { CSSProperties, HTMLAttributes } from 'react';

import classnames from 'classnames';

import { useIcon } from './hook/useIcon';
import { useIconComponent } from './hook/useWrapperStrategy';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
  container?: React.ComponentType<any>;
}

export interface IconContainerProps {
  content: string;
}

function getTagName(content: string) {
  // 使用正则表达式匹配标签名称
  if (!content) {
    return 'unknown';
  }

  const tagMatch = content.trim().match(/^<(\w+)/);

  if (tagMatch) {
    const tagName = tagMatch[1].toLowerCase();
    if (tagName === 'svg') {
      return 'svg';
    } else if (tagName === 'i') {
      return 'i';
    } else {
      return 'unknown';
    }
  } else {
    return 'unknown';
  }
}

const DefaultIconContainer = React.forwardRef((props: any, ref: any) => {
  let { className, content, ...otherProps } = props;
  const tagName = getTagName(content);
  return React.createElement('span', {
    ...otherProps,
    ref,
    dangerouslySetInnerHTML: {
      __html: content,
    },
    className: classnames(className, { 'svg-icon': tagName === 'svg' }),
  });
});

function Icon(props: IconProps, ref: any) {
  let { name, onClick, className, style, container, ...otherProps } = props;

  const [libName, iconName] = name.split('/');

  const content = useIcon(name);
  const IconComponent = useIconComponent(libName, iconName, content!);
  const ComponentToRender: React.ElementType<any> =
    ((IconComponent as unknown) as React.ElementType<any>) || DefaultIconContainer;
  return React.createElement(ComponentToRender, {
    ...otherProps,
    ref,
    onClick,
    content,
    style,
    className,
  });
}

export default React.forwardRef(Icon);
