import {createFeature}  from 'feature-u';
import featureFlags     from 'featureFlags'
import {leftNavManager} from 'features';

// sandbox class registrations
// ... not necessarily in LeftNav, but needed to retrieve packages containing these components
import generalCompsPkg  from './konvaSandbox/generalComps';
import                       './konvaSandbox/sceneView1';
import                       './konvaSandbox/sceneView2';

// only needed if reference un-commented (below)
//? import konvaSandboxSmartPkg  from './konvaSandbox/konvaSandboxSmartPkg';
//? import SmartPkg              from 'core/SmartPkg';
//? import {createLogger}        from 'util/logger';
//? const log = createLogger('***DIAG*** konvaSandboxSmartPkg ... ').enable();

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',

  enabled: featureFlags.sandbox,

  // register sandbox LeftNav packages
  appInit({showStatus, fassets, getState, dispatch}) {

    // our sandbox code-based component package
    leftNavManager.addLeftNav(generalCompsPkg);

    // konvaSandboxSmartPkg
    // ... commented out (we can now dynamically load this from a resource file)
    //? leftNavManager.addLeftNav(konvaSandboxSmartPkg);
  },
});

// to prime-the-pump, generate a visualize-it file from a package build by code
// 1. uncomment this code
// 2. mouse the JSON string (found in logs)
// 3. into a file (ex: C:\Users\kevin\Dropbox\Camera Uploads\visualize-it\myFirst.vit)
// 4. load the package from a file (via the visualize-it file menu)
//? log(`PERSISTENT TEST: JSONIZE smartPkg: `, {konvaSandboxSmartPkg});
//? const smartJSON = konvaSandboxSmartPkg.toSmartJSON();
//? log(`PERSISTENT TEST: HERE is the json: `, {smartJSON, str: JSON.stringify(smartJSON) });
//? const rehydratedSmartPkg = SmartPkg.fromSmartJSON(smartJSON);
//? log(`PERSISTENT TEST: HERE is the RE-HYDRATED smartPkg: `, {rehydratedSmartPkg});

