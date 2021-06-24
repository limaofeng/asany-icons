// import classnames from 'classnames';
import React from 'react';

// import ScrubbableControl from '../../asany-editor/components/aside/components/data-entry/ScrubbableControl';
// import ListTree, { ListTreeNodeRenderProps } from '../../asany-editor/components/aside/components/ListTree';
// import Icon from '../../icon';
// import categories from '../../icon/manifest';

// interface IconRenderProps /*extends ListTreeNodeRenderProps*/ {
//   name: string;
// }

// function IconRender(props: IconRenderProps) {
//   const { selected, ...item } = props;

//   const handleClick = useCallback(() => {
//     props.onChange(props.id);
//   }, []);

//   return (
//     <li
//       onClick={handleClick}
//       className={classnames('tree-node-item flex flex-col justify-end items-center', { active: selected })}
//     >
//       {/* <Icon name={item.name} /> */}
//       <span className="tree-node-item-title">{item.name}</span>
//     </li>
//   );
// }

interface LibraryPanelProps {
  value?: string;
  visible: boolean;
  onChange: (name: string) => void;
}

function LibraryPanel(_: LibraryPanelProps) {
  // const { value, visible, onChange } = props;
  // const treeData = [];
  // categories.map((item) => ({
  //   ...item,
  //   children: [
  //     {
  //       id: item.id + '-line',
  //       name: '线框图标',
  //       children: item.icons.map((item) => ({ id: item + 'Line', name: item + 'Line' })),
  //     },
  //     {
  //       id: item.id + '-solid',
  //       name: '实体图标',
  //       children: item.icons.map((item) => ({ id: item + 'Solid', name: item + 'Solid' })),
  //     },
  //   ],
  // }));

  // const handleChange = useCallback((data) => {
  //   onChange(data.id);
  // }, []);

  return (
    <>
      <div className="ae-popover-search flex items-center">
        {/* <ScrubbableControl icon="Search" className="basic-input" trigger="change" autoSelect={false} value="" /> */}
      </div>
      <div className="ae-popover-content">
        {/* <ListTree
          labelName="name"
          reload={visible}
          value={value}
          onChange={handleChange}
          treeData={treeData}
          itemRender={IconRender}
        /> */}
      </div>
    </>
  );
}

export default LibraryPanel;
