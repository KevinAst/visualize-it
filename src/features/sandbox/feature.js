import {createFeature}  from 'feature-u';
import featureFlags     from 'featureFlags'
import {leftNavManager} from 'features';
import pkgManager       from 'core/pkgManager';
import                  './konvaSandbox/konvaSandboxSmartPkg'; // unnamed import activating it's package registration

const generalCompsPkg      = pkgManager.getPackage('generalComps');
const konvaSandboxSmartPkg = pkgManager.getPackage('com.astx.KONVA');

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',

  enabled: featureFlags.sandbox,

  // register sandbox LeftNav packages
  appInit({showStatus, fassets, getState, dispatch}) {

    // our sandbox code-based component package
    leftNavManager.addLeftNav(generalCompsPkg);

    // our sandbox resource-based system package
    leftNavManager.addLeftNav(konvaSandboxSmartPkg);
  },
});
