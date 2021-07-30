import 'react-app-polyfill/ie11';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Icon, IconProvider, useStore } from '../src';

import IconDisplay from './IconDisplay';
import { useEffect } from 'react';

const client = new ApolloClient({
  uri: 'http://api.asany.cn/graphql',
  cache: new InMemoryCache(),
});

const App = () => {
  const store = useStore();

  const handleFile = e => {
    const files = e.target.files;
    store.import('302', files[0]);
  };

  useEffect(() => {
    store.addIcons([{ name: 'test', svg: '123' }]);
  }, []);

  return (
    <div>
      <ApolloProvider client={client}>
        <IconProvider>
          <h3>图标加载：</h3>
          <Icon name="nifty/us-la" />
          <br />
          <div style={{ marginTop: 50 }}>
            <h3>图标解析：</h3>
            <input type="file" onChange={handleFile} />
            <IconDisplay />
          </div>
        </IconProvider>
      </ApolloProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));