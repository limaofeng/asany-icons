import { useEffect, useState } from 'react';

import { IconDefinition } from '../typings';

import { useStore } from './useStore';

export const useIcon = (name: string): string | undefined => {
  const store = useStore();
  const [icon, setIcon] = useState<IconDefinition | undefined>(undefined);

  useEffect(() => {
    const delay = store.get(name);
    let _reject: { (): any; (reason?: any): void };
    const cancel = new Promise<IconDefinition | undefined>((_, reject) => {
      _reject = reject;
    });
    Promise.race([delay, cancel])
      .then(setIcon)
      .catch(error => console.info(error));
    const unsubscribe = store.on(name, icon => {
      setIcon(icon);
    });
    return () => {
      unsubscribe();
      _reject && _reject(`卸载图标:${name}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return icon?.content;
};
