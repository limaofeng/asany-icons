import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Thing, IconPicker } from '../.';

const App = () => {
  return (
    <div>
      <IconPicker />
      <Thing />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
