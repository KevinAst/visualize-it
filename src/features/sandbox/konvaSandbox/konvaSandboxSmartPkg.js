import SmartPkg        from 'core/SmartPkg';

import {scene1}        from './sceneView1';
import {scene2}        from './sceneView2';
import {collage1}      from './collageView1';

//******************************************************************************
//*** konvaSandboxSmartPkg: our FIRST smartPkg!!
//******************************************************************************

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
export default konvaSandboxSmartPkg;
