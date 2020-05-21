import {featureFlags} from '../App.svelte'
import {viewPkg}      from '../pkgViewer';
import pkgManager     from '../core/pkgManager';
import {createLogger} from '../util/logger';
import                './konvaSandboxSmartPkg'; // unnamed import activating it's package registration
const  log = createLogger('***DIAG*** sandbox feature ... ').disable();

// feature: sandbox
//          sandbox to play with konva.js

// when sandbox is enabled, register the various sandbox packages to our LeftNav??
if (featureFlags.sandbox) {
  // our sandbox code-based component package
  const generalCompsPkg = pkgManager.getPkg('generalComps');
  viewPkg(generalCompsPkg);

  // our sandbox resource-based system package
  const konvaSandboxSmartPkg = pkgManager.getPkg('com.astx.KONVA');
  viewPkg(konvaSandboxSmartPkg);

  // our clonedPkg
  const clonedPkg = pkgManager.getPkg('cloned.pkg');
  // ... quick-and-dirty-test of PkgViewer reactivity (via timeout)
  setTimeout( () => log(`adding viewPkg('cloned.pkg')`) || viewPkg(clonedPkg), 5000);
}
