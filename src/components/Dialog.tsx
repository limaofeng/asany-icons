import React, { useRef, useState } from 'react';
// import { useClickAway } from 'react-use';

// import IconButton from '../../asany-editor/components/aside/components/IconButton';
import LibraryPanel from './LibraryPanel';
import UploadPanel from './UploadPanel';

type Mode = 'library' | 'upload';

interface DialogProps {
  close: () => void;
  visible: boolean;
  value?: string;
  onChange: (name: string) => void;
}

function Dialog({ value, /*close,*/ visible, onChange }: DialogProps) {
  const [mode] = useState<Mode>('upload');

  const ref = useRef<HTMLDivElement>(null);

  /*   useClickAway(ref, () => {
    close();
  }); */

  /*   const handleToggleMode = (mode: Mode) =>
    useCallback(() => {
      setMode(mode);
    }, [mode]);
 */
  return (
    <div className="ant-popover asanyeditor-dsign-light-popover asanyeditor-dsign-popover ant-popover-placement-topLeft">
      <div className="ant-popover-content">
        <div className="ant-popover-inner">
          <div className="ant-popover-inner-content">
            <div ref={ref} className="ae-popover">
              <div className="ae-popover-header flex items-center">
                <span className="ae-popover-header-title flex-1">图标选择</span>
                {/* <IconButton icon="UploadToCloudLine" onClick={handleToggleMode('upload')} checked={mode == 'upload'} /> */}
                {/* <IconButton icon="Library2Line" onClick={handleToggleMode('library')} checked={mode == 'library'} /> */}
              </div>
              {mode == 'upload' ? (
                <UploadPanel />
              ) : (
                <LibraryPanel visible={visible} value={value} onChange={onChange} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Dialog);
