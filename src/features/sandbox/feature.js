import {createFeature}  from 'feature-u';
import featureFlags     from 'featureFlags'
import initSandbox      from './initSandbox';

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',
  enabled: featureFlags.sandbox,
  appInit: initSandbox,
});
