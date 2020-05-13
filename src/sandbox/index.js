import featureFlags     from '../featureFlags'
// import {leftNavManager} from 'features/xtra'; AI: ?? retrofit to pkgViewer (previously leftNavManager)
import pkgManager       from '../core/pkgManager';
import                  './konvaSandboxSmartPkg'; // unnamed import activating it's package registration

// feature: sandbox
//          sandbox to play with konva.js

console.log(`?? executing import ... sandbox/index.js`);


// when sandbox is enabled, register the various sandbox packages to our LeftNav??
if (featureFlags.sandbox) {

  // our sandbox code-based component package
  const generalCompsPkg = pkgManager.getPkg('generalComps');
//leftNavManager.addLeftNav(generalCompsPkg);

  // our sandbox resource-based system package
  const konvaSandboxSmartPkg = pkgManager.getPkg('com.astx.KONVA');
//leftNavManager.addLeftNav(konvaSandboxSmartPkg);

  // our clonedPkg
  const clonedPkg = pkgManager.getPkg('cloned.pkg');
//leftNavManager.addLeftNav(clonedPkg);
}
