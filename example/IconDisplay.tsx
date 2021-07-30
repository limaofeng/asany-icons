import * as React from 'react';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';

import { Icon, useStore } from '../src';
import { IconLibrary } from '../src/store/IconDatabase';

function IconDisplay() {
  const store = useStore();

  const [libraries, setLibraries] = useState<IconLibrary[]>([]);

  const loadLibraries = useCallback(async () => {
    console.time('load libraries');
    const libraries = await store.libraries();
    console.log('libraries:', libraries);
    setLibraries(libraries);
    console.timeEnd('load libraries');
  }, []);

  useEffect(() => {
    loadLibraries();
    return store.onChange(loadLibraries);
  }, []);

  return (
    <div>
      {libraries.map(lib => (
        <div key={lib.id}>
          <div>
            <h1 style={{ display: 'inline-block' }}>{lib.name}</h1>
            <span>{lib.description}</span>
          </div>
          <hr />
          <div>
            {lib.tags.map(tag => (
              <div key={`${lib.id}-${tag.id}`}>
                <div>
                  <h4 style={{ display: 'inline-block' }}>{tag.path}</h4>
                </div>
                <div>
                  {lib.icons
                    .filter(icon => icon.tags.includes(tag.path))
                    .map(icon => (
                      <Icon
                        key={icon.id}
                        style={{ padding: 10 }}
                        name={`${lib.name}/${icon.name}`}
                      />
                    ))}
                </div>
              </div>
            ))}
            {!!lib.icons.filter(icon => !icon.tags.length).length && (
              <div key={`${lib.id}-unclassified`}>
                <div>
                  <h4 style={{ display: 'inline-block' }}>未分组</h4>
                </div>
                <div>
                  {lib.icons
                    .filter(icon => !icon.tags.length)
                    .map(icon => (
                      <Icon
                        key={icon.id}
                        style={{ padding: 10 }}
                        name={`${lib.name}/${icon.name || icon.unicode}`}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default IconDisplay;
