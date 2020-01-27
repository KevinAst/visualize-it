import SmartPkg        from 'core/SmartPkg';

import {scene1}        from './sceneView1';
import {scene2}        from './sceneView2';
import {collage1}      from './collageView1';

import {createLogger}  from 'util/logger';

// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** konvaSandboxSmartPkg ... ').enable();


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

// RE-HYDRATE the smartPkg to simulate it coming from a file resource
// ... just JSONize and back
log(`PERSISTENT TEST: JSONIZE smartPkg: `, {konvaSandboxSmartPkg});
const smartJSON = konvaSandboxSmartPkg.toSmartJSON();
log(`PERSISTENT TEST: HERE is the json: `, {smartJSON});
const rehydratedSmartPkg = SmartPkg.fromSmartJSON(smartJSON);
log(`PERSISTENT TEST: HERE is the RE-HYDRATED smartPkg: `, {rehydratedSmartPkg});

export default rehydratedSmartPkg;
//? export default konvaSandboxSmartPkg;
