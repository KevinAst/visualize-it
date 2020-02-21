import {createFeature}  from 'feature-u';
import _toolBar         from './featureName';
import reducer          from './state';
import logic            from './logic';

// feature: toolBar
//          manages the toolbar and it's dynamics
export default createFeature({
  name: _toolBar,
  reducer,
  logic,
});
