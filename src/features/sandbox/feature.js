import {createFeature}  from 'feature-u';
import featureFlags     from 'featureFlags'
import {leftNavManager} from 'features/xtra';
import pkgManager       from 'core/pkgManager';
import                  './konvaSandbox/konvaSandboxSmartPkg'; // unnamed import activating it's package registration

// feature: sandbox
//          sandbox to play with konva.js
export default createFeature({
  name:    'sandbox',

  enabled: featureFlags.sandbox,

  // register sandbox LeftNav packages
  appInit({showStatus, fassets, getState, dispatch}) {

    // our sandbox code-based component package
    const generalCompsPkg = pkgManager.getPkg('generalComps');
    leftNavManager.addLeftNav(generalCompsPkg);

    // our sandbox resource-based system package
    const konvaSandboxSmartPkg = pkgManager.getPkg('com.astx.KONVA');
    leftNavManager.addLeftNav(konvaSandboxSmartPkg);

    // our clonedPkg
    const clonedPkg = pkgManager.getPkg('cloned.pkg');
    leftNavManager.addLeftNav(clonedPkg);
  },
});
