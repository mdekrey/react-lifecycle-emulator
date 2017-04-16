import * as React from 'react';
import { render } from 'react-dom';

import {LifecycleCheck} from './lifecycle-check';

const rootEl = document.getElementById('app');

// And render our App into it, inside the HMR App Container which handles the reloading
render(
  <div>
    <LifecycleCheck />
  </div>,
  rootEl,
);
