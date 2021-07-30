import React, { useCallback, useState } from 'react';

import Dialog from './components/Dialog';

export interface IconPickerProps {
  value: string;
  onChange: (value?: string) => void;
}

function IconPicker(props: IconPickerProps) {
  const { onChange } = props;
  const [visible, setVisible] = useState(true);

  const handleChange = useCallback(data => {
    setVisible(false);
    onChange && onChange(data);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Dialog
      visible={visible}
      value={''}
      onChange={handleChange}
      close={handleClose}
    />
  );
}

export default IconPicker;
