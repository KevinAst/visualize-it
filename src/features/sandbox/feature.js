import {createFeature}  from 'feature-u';
import featureFlags     from 'featureFlags'
//import route          from './route'; ?? obsolete
import initSandbox      from './initSandbox';

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',
  enabled: featureFlags.sandbox,
//route, // ?? obsolete this (with new tabManager)
  appInit: initSandbox,
});
