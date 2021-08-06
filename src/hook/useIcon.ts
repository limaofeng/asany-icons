import { useEffect, useState } from 'react';
import { Icon } from '../store/IconDatabase';
import { useStore } from './useStore';

export const useIcon = (name: string): string | undefined => {
  const store = useStore();
  const [icon, setIcon] = useState<Icon | undefined>(undefined);

  useEffect(() => {
    const delay = store.get(name);
    let _reject: { (): any; (reason?: any): void };
    const cancel = new Promise<Icon | undefined>((_, reject) => {
      _reject = reject;
    });
    Promise.race([delay, cancel]).then(icon => {
      setIcon(icon);
    });
    const unsubscribe = store.on(name, icon => {
      setIcon(icon);
    });
    return () => {
      unsubscribe();
      _reject && _reject();
    };
  }, []);

  return icon?.content;
};
