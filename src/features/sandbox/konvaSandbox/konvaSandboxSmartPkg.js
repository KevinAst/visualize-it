import SmartPkg     from 'core/SmartPkg';
import pkgManager   from 'core/pkgManager';
import {collage1}   from './collageView1';

const scene1 = pkgManager.getClassRef('sceneView1', 'scene1').pseudoClassContainer;
const scene2 = pkgManager.getClassRef('sceneView2', 'scene2').pseudoClassContainer;


//******************************************************************************
//*** konvaSandboxSmartPkg: our FIRST smartPkg!!
//******************************************************************************

// NOTE: this is what we use to hydrate our first JSON resource file (via crude logs)
// ?? I think we can pull in that prime-the-pump stuff from feature.js

const konvaSandboxSmartPkg = new SmartPkg({
  id:   'com.astx.KONVA',
  name: 'Konva Sandbox II',
  entries: {
    scenes: [
      scene1,
      { // ... nested sub-entries mixed in with our tabs
        "More Depth": [
          scene2,
        ],
      },
    ],
    collages: [
      collage1,
    ],
  },
});
pkgManager.registerPkg(konvaSandboxSmartPkg);

export default konvaSandboxSmartPkg;
