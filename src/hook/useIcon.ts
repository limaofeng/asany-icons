import { useEffect, useState } from 'react';
import { Icon } from '../store/IconDatabase';
import { useStore } from './useStore';

export const useIcon = (name: string): string | undefined => {
  const store = useStore();
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
