import React, { useEffect, useMemo } from 'react';

import { WithApolloClient, withApollo } from '@apollo/client/react/hoc';

import IconStore from './store';
import { IconWrapperStrategyManager } from './hook/useWrapperStrategy';

import './index.less';

export const store = new IconStore();
export const strategyManager = new IconWrapperStrategyManager();

export const IconContext = React.createContext<{
  store: IconStore;
  strategyManager: IconWrapperStrategyManager;
}>({
  store,
  strategyManager: strategyManager,
});

interface IconProviderProps {
  children: React.ReactNode;
}

function IconProvider(props: WithApolloClient<IconProviderProps>) {
  const { client } = props;

  useEffect(() => {
    store.setClient(client!);
    store.loadRemote();
  }, [client]);

  return useMemo(
    () => (
      <IconContext.Provider
        value={{
          store,
          strategyManager,
        }}
      >
        {props.children}
      </IconContext.Provider>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export default withApollo(IconProvider as any);
