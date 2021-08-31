import { MockedResponse } from '@apollo/client/testing';
import moment from 'moment';

import { ALL_ICON_LIBRARIES, QUERY_CHECK_POINT } from '../src/store';

import libraries from './libraries.json';
import oplogs from './oplogs.json';

const mocks: MockedResponse<Record<string, any>>[] = [
  {
    request: {
      query: ALL_ICON_LIBRARIES,
    },
    result: libraries,
  },
  {
    request: {
      query: QUERY_CHECK_POINT,
      variables: {
        filter: {
          entityName_in: ['Icon', 'IconLibrary'],
          createdAt_gt: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
      },
    },
    result: oplogs,
  },
];

export default mocks;
