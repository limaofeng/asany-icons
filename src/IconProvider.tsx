import React, { useEffect, useMemo } from 'react';

import { WithApolloClient, withApollo } from '@apollo/client/react/hoc';

import IconStore from './store';

import './index.less';

export const store = new IconStore();
export const IconContext = React.createContext<IconStore>(store);

interface IconProviderProps {
  children: React.ReactNode;
}

function IconProvider(props: WithApolloClient<IconProviderProps>) {
  const { client } = props;

  useEffect(() => {
    store.setClient(client!);
    store.loadRemote();
  }, [client]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => <IconContext.Provider value={store}>{props.children}</IconContext.Provider>, []);
}

export default withApollo(IconProvider as any);
