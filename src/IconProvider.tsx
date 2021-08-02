import { withApollo, WithApolloClient } from '@apollo/client/react/hoc';
import React, { useEffect, useMemo } from 'react';
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
  }, []);

  return useMemo(() => <IconContext.Provider value={store}>{props.children}</IconContext.Provider>, []);
}

export default withApollo(IconProvider as any);
