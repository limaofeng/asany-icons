import { useEffect, useMemo, useState } from 'react';

import { IconDefinition } from '../../types';

import { useStore } from './useStore';

const cache = new Map<string, IconDefinition>();

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
      .then(item => {
        setIcon(item);
        cache.set(name, item!);
      })
      .catch(error => console.info(error));
    const unsubscribe = store.on(name, icon => {
      setIcon(icon);
      cache.set(name, icon);
    });
    return () => {
      unsubscribe();
      _reject && _reject(`卸载图标:${name}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return useMemo(() => {
    if (!icon || !icon.content) {
      return cache.get(name)?.content;
    }
    return icon.content;
  }, [name, icon]);
};
