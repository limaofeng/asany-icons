import { useContext } from 'react';
import React from 'react';

import { IconContext } from '../IconProvider';

export interface IconWrapperStrategy {
  supports(lib: string, icon: string, content: string): boolean;
  getComponent(): React.Component<any>;
  priority: number;
}

export class IconWrapperStrategyManager {
  private strategies: IconWrapperStrategy[] = [];

  register(strategy: IconWrapperStrategy) {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  getStrategies() {
    return this.strategies;
  }
}

export const useRegisterStrategy = (): ((strategy: IconWrapperStrategy) => void) => {
  return useContext(IconContext).strategyManager.register;
};

export const useStrategies = (): IconWrapperStrategy[] => {
  return useContext(IconContext).strategyManager.getStrategies();
};

export const useIconComponent = (lib: string, icon: string, content: string): React.Component<any> | undefined => {
  const strategies = useStrategies();
  for (const strategy of strategies) {
    if (strategy.supports(lib, icon, content)) {
      return strategy.getComponent();
    }
  }
  return undefined;
};
