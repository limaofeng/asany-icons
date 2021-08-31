import * as React from 'react';

import { MockedProvider } from '@apollo/client/testing';
import * as ReactDOM from 'react-dom';

import { Icon, IconProvider } from '../src';
import mocks from '../__mocks__/graphqlMock';
import { sleep } from '../src/utils';

describe('it', () => {
  it('renders without crashing', async () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <IconProvider>
          <Icon name="NiftyLine/us-la" />
        </IconProvider>
      </MockedProvider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
    await sleep(1000);
  });
});
