// import { CloseCircleFilled } from '@ant-design/icons';
// import { Popover } from 'antd';
// import classnames from 'classnames';
import React, { useCallback, useState } from 'react';
// import type { AlignType } from 'rc-trigger/lib/interface';

// import IconButton from '../asany-editor/components/aside/components/IconButton';
import Dialog from './components/Dialog';

import './index.less';

export interface IconPickerProps {
  value: string;
  //   align?: AlignType;
  onChange: (value?: string) => void;
}

function IconPicker(props: IconPickerProps) {
  const { /*align = '', value,*/ onChange } = props;
  console.log(useState);
  const [visible, setVisible] = useState(true);

  /*  const handleClick = useCallback(() => {
    setVisible(!visible);
  }, [visible]); */

  const handleChange = useCallback(data => {
    setVisible(false);
    onChange && onChange(data);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);
  /* 
  const handleCleanUp = useCallback(() => {
    onChange && onChange(undefined);
  }, []);
*/
  return (
    <Dialog
      visible={visible}
      value={''}
      onChange={handleChange}
      close={handleClose}
    />
  );

  /*
  return (
    <div className="icon-picker flex flex-row items-center">
{/*       <Popover
        placement="bottomLeft"
        visible={visible}
        align={align}
        arrowPointAtCenter={false}
        overlayClassName={classnames('asanyeditor-dsign-light-popover asanyeditor-dsign-popover')}
        content={<Dialog visible={visible} value={value} onChange={handleChange} close={handleClose} />}
        transitionName=""
      >
        <IconButton className="icon-preview" icon={value || 'RecordLine'} onClick={handleClick} />
      </Popover> 
      <a className="clean-up" onClick={handleCleanUp}>
          xx
      </a>
    </div>
  );
  */
}

export default IconPicker;
