import { MockedResponse } from '@apollo/client/testing';
import moment from 'moment';

import { ALL_ICON_LIBRARIES, QUERY_CHECK_POINT, QUERY_ICONS, QUERY_LIBRARIES } from '../src/store';

import iconLibraries from './iconLibraries.json';
import libraries from './libraries.json';
import oplogs from './oplogs.json';
import icons from './icons.json';

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
  {
    request: {
      query: QUERY_ICONS,
      variables: {
        ids: ['25148'],
      },
    },
    result: icons,
  },
  {
    request: {
      query: QUERY_LIBRARIES,
      variables: {
        ids: ['762'],
      },
    },
    result: iconLibraries,
  },
];

export default mocks;
