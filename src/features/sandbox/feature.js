import {createFeature}       from 'feature-u';
import featureFlags          from 'featureFlags'
//? pull in from file
// import {leftNavManager}      from 'features';
import konvaSandboxSmartPkg  from './konvaSandbox/konvaSandboxSmartPkg';
   // ?? WEIRD: without prior import: ReferenceError: Cannot access 'SmartModel' before initialization
   //           - src/core/SmartPkg.js                                  is extending SmartModel (line 97) (in this scenerio SmartModel is NOT YET defined)
   //           - src/core/PkgManager.js                                is importing SmartPkg   (line 1)
   //           - src/core/SmartModel.js                                is being expanded       (I THINK)
   //           - src/features/common/baseUI/comp/LeftNavMenuPallet.js  is being expanded       (I THINK)
   //           - src/features/common/baseUI/LeftNavManager.js          is being expanded       (I THINK)
   //           - src/features/common/baseUI/feature.js                 is being expanded       (I THINK)
   //           - src/features/index.js                                 is being expanded       (I THINK)
   //           - src/app.js                                            is being expanded       (I THINK)
   //           - src/index.js                                          is being expanded       (I THINK)

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',

  enabled: featureFlags.sandbox,

  //? pull in from file
  //? appInit({showStatus, fassets, getState, dispatch}) {
  //?   leftNavManager.addLeftNav(konvaSandboxSmartPkg);
  //? },
});
