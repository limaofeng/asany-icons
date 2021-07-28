import { useEffect, useState } from 'react';
import { Icon } from '../IconDatabase';
import store from '../index';

export const useIcon = (name: string): string | undefined => {
  const [icon, setIcon] = useState<Icon | undefined>(undefined);

  useEffect(() => {
    store.get(name).then(icon => {
      setIcon(icon);
    });
    return store.on(name, icon => {
      setIcon(icon);
    });
  }, []);

  return icon?.content;
};
