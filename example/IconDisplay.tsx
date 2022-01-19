import * as React from 'react';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';

import { Icon, useStore } from '../src';
import { IconLibraryDefinition } from '../types';

function IconDisplay() {
  const store = useStore();

  const [libraries, setLibraries] = useState<IconLibraryDefinition[]>([]);

  const loadLibraries = useCallback(async () => {
    console.time('load libraries');
    const libraries = await store.libraries();
    console.log('libraries', libraries);
    setLibraries(libraries);
    console.timeEnd('load libraries');
  }, []);

  useEffect(() => {
    loadLibraries();
    return store.onChange(loadLibraries);
  }, []);

  const handleFile = (lib: IconLibraryDefinition) => e => {
    const files = e.target.files;
    store.import(lib.id!, files[0]);
  };

  return (
    <div>
      {libraries.map(lib => (
        <div key={lib.id}>
          <div>
            <h1 style={{ display: 'inline-block', marginRight: 16 }}>
              {lib.name}({lib.type}) - {lib.icons.length}
            </h1>
            <span style={{ marginRight: 16 }}>{lib.description}</span>
            {lib.name !== 'local' && <input multiple type="file" onChange={handleFile(lib)} />}
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
                    .slice(0, 100)
                    .map(icon => (
                      <Icon key={icon.id} style={{ padding: 10, width: 32 }} name={`${lib.name}/${icon.name}`} />
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
                    .slice(0, 100)
                    .map(icon => (
                      <Icon
                        key={icon.id}
                        style={{ padding: 10, width: 32, display: 'inline-block' }}
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
