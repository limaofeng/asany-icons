import 'react-app-polyfill/ie11';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';

import { Icon, IconProvider, store } from '../src';
import { parseIconFile } from '../src/utils';
import IconDisplay from './IconDisplay';

const client = new ApolloClient({
  uri: 'https://api.asany.cn/graphql',
  cache: new InMemoryCache(),
});

store.addIcons('test', '1.0', [{ name: 'test', svg: '123' }]);

const App = () => {
  const [svgs, setSvgs] = useState<string[]>([]);
  const handleFile = async e => {
    const icons = await parseIconFile(e.target.files[0]);
    setSvgs(icons.map(({ content }) => content));
  };
  return (
    <div>
      <h3>解析文件测试：</h3>
      <br />
      <input type="file" onChange={handleFile} />
      <br />
      <div
        style={{ width: '100%', overflow: 'auto', padding: '10px' }}
        dangerouslySetInnerHTML={{ __html: svgs.join('') }}
      />
      <ApolloProvider client={client}>
        <IconProvider>
          <h3>图标加载：</h3>
          <Icon name="nifty/us-la" />
          <br />
          <div style={{ marginTop: 50 }}>
            <IconDisplay />
          </div>
        </IconProvider>
      </ApolloProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
