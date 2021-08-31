import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';

import IconStore from '../src/store';
import { sleep } from '../src/utils';
import mocks from '../__mocks__/graphqlMock';

let store: IconStore;

beforeAll(() => {
  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: new MockLink(mocks, false),
  });
  store = new IconStore();
  store.setClient(client);
});

describe('it', () => {
  it('store loadRemote', async () => {
    console.log('store', store);
    await store.loadRemote();
    await sleep(200);
    await store.loadRemote();
  }, 10000);

  it('store local', async () => {
    await store.local();
  });

  it('renders without crashing', async () => {});
});
