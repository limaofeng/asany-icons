import { useContext } from 'react';

import { IconContext } from '../IconProvider';
import IconStore from '../store';

export const useStore = (): IconStore => {
  return useContext(IconContext);
};
