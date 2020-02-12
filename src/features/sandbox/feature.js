import {createFeature}       from 'feature-u';
import featureFlags          from 'featureFlags'
//? needed to: pull package in from code
//import {leftNavManager}      from 'features';
import /*konvaSandboxSmartPkg  from*/ './konvaSandbox/konvaSandboxSmartPkg'; // ??$$ "HACK" STILL NEEDED: till we register things like Valve1 a different way

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',

  enabled: featureFlags.sandbox,

  //? pull package in from code
  //? appInit({showStatus, fassets, getState, dispatch}) {
  //?   leftNavManager.addLeftNav(konvaSandboxSmartPkg);
  //? },
});
