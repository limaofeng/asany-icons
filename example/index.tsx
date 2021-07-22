import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import IconProvider from '../src/IconProvider';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import Icon from '../src/Icon';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

const App = () => {
  console.log('client:', client);
  return (
    <div>
      为什么没有东西:
    <ApolloProvider client={client}>
      <IconProvider>
        <Icon name="xxx" />
      </IconProvider>
    </ApolloProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
