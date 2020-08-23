import Collage        from '../core/Collage';
import Scene          from '../core/Scene';
import SmartClassRef  from '../core/SmartClassRef';
import SmartPkg       from '../core/SmartPkg';
import pkgManager     from '../core/pkgManager';
import {replaceAll}   from '../util/strUtil';
import {createLogger} from '../util/logger';
import                     './generalComps'; // unnamed import activating it's package registration

const log = createLogger('***DIAG*** konvaSandboxSmartPkg ... ').disable(); // enable this to see JSON in logs

const Valve1 = pkgManager.getClassRef('generalComps', 'Valve1');
const Valve2 = pkgManager.getClassRef('generalComps', 'Valve2');
const Valve3 = pkgManager.getClassRef('generalComps', 'Valve3');


//************************************************************************************
//*** Scene: scene1Master ... a pseudoClass MASTER
//************************************************************************************

const scene1Master = new Scene({
  id: 'Scene1',
  comps: [
    Valve1.createSmartObject({id: 'myValve1', x:  20, y:  20}),
    Valve2.createSmartObject({id: 'myValve2', x: 150, y:  40}),
    Valve3.createSmartObject({id: 'myValve3', x:  50, y: 120}),
  ],
});


//************************************************************************************
//*** Scene: scene2Master ... a pseudoClass MASTER
//************************************************************************************

const scene2Master = new Scene({
  id: 'Scene2',
  comps: [
    Valve1.createSmartObject({id: 'myValve1', x:  20, y:  20}),
    Valve2.createSmartObject({id: 'myValve2', x: 150, y:  40}),
  ],
});


//**********************************************************
//*** Collage: collage1
//**********************************************************

// NOTE: The scenes used in our collage must be instance copies of the
//       master (defined above). To create these copies, we need their
//       pseudo class reference (SmartClassRef).
//
//       NORMALLY, we would ask the pkgManager for this:
//
//         const scene1ClassRef = pkgManager.getClassRef('com.astx.KONVA', 'Scene1');
//
//       HOWEVER, this is NOT possible in this case, because we are creating this
//       self-referencing pkg yet (i.e. the pkg doesn't exist yet)!
//
//       THEREFORE, as a work-around we create a temporary classRef, who's
//       'UNKNOWN-PKG-ID' is NOT retained in a persistent source ... for example:
//
//         const scene1ClassRef = new SmartClassRef(scene1Master);

const scene1ClassRef = new SmartClassRef(scene1Master);
const scene1Instance = scene1ClassRef.createSmartObject({
  id: 'Scene1',
  // comps: [ // KOOL: do NOT need comps ... they are created (cloned) from the scene1 pseudoClass!
  //          new Valve1({id: 'myValve1'}),
  //          new Valve2({id: 'myValve2'}),
  //          new Valve3({id: 'myValve3'}),
  // ],
  x:0,
  y:0,
});

const scene2ClassRef = new SmartClassRef(scene2Master);
const scene2Instance = scene2ClassRef.createSmartObject({
  id: 'Scene2',
  // comps: [ // KOOL: do NOT need comps ... they are created (cloned) from the scene2 pseudoClass!
  //   new Valve1({id: 'myValve1'}),
  //   new Valve2({id: 'myValve2'}),
  //   // new Valve3({id: 'myValve3'}), // omit JUST to make it different
  // ],
  x:300,
  y:250,
});

const collage1 = new Collage({id: 'collage1', name: 'Collage 1', scenes: [scene1Instance, scene2Instance]});


//******************************************************************************
//*** konvaSandboxSmartPkg: our FIRST smartPkg!!
//******************************************************************************

const konvaSandboxSmartPkg = new SmartPkg({
  id:   'com.astx.KONVA',
  name: 'Konva Sandbox I',
  entries: [
    {
      scenes: [
        scene1Master,
        { // ... nested sub-entries mixed in with our tabs
          "More Depth": [
            scene2Master,
          ],
        },
      ],
    },
    {
      collages: [
        collage1,
      ],
    },
  ]
});

pkgManager.registerPkg(konvaSandboxSmartPkg);


//******************************************************************************
//*** CRUDE TEST: Exercise clone process to insure NO runtime errors :-)
//******************************************************************************

// clone konvaSandboxSmartPkg
const clonedPkg = konvaSandboxSmartPkg.smartClone();

// rename, so clonedPkg can co-exist (in pkgManager) with konvaSandboxSmartPkg
// ... NOTE: Even with this rename, the clonedPkg will retain the original
//           self referenced pkg of: "com.astx.KONVA"
//           ... SO the konvaSandboxSmartPkg must be pre-registered for 
//               the clonedPkg to operate
clonedPkg.id   = 'cloned.pkg';
clonedPkg.name = 'Cloned Pkg';
// ... simulate what would happen if the manual change above was in our controlled environment
clonedPkg.trickleUpChange(); // ... sync the change
// ... re-baseline the baseCrc (so it doesn't start out needing to be saved)
clonedPkg.resetBaseCrc();

// register clonedPkg to our pkgManager
pkgManager.registerPkg(clonedPkg);



//******************************************************************************
//*** CRUDE TEST: Exercise JSON persistance to insure NO runtime errors :-)
//******************************************************************************

// You can use the logged JSON to prime-the-pump, manually placing in a visualize-it file, and loading it in the system
// 1. enable the log control (at the top of this file) to see the JSON in our logs
// 2. mouse the JSON string (found in logs)
// 3. into a file (ex: C:\Users\kevin\Dropbox\Camera Uploads\visualize-it\myFirst.vit)
// 4. load the package from that file (via the visualize-it file menu)

// convert to JSON
log(`PERSISTENT TEST: JSONIZE smartPkg:\n`, {konvaSandboxSmartPkg});
const json = konvaSandboxSmartPkg.toSmartJSON();
log(`PERSISTENT TEST: HERE is the json:\n`, {json});

// for this conversion to be self-sufficient, we need to change the pkgId/pkgName in the JSON
const pkgId   = konvaSandboxSmartPkg.id;
const pkgName = konvaSandboxSmartPkg.name;
let   jsonStr = JSON.stringify(json, null, 2);
jsonStr = replaceAll(jsonStr,          // pkgId (including any self referenced pkgId)
                     `"${pkgId}"`,     //   ex: "com.astx.KONVA"
                     `"${pkgId}2"`);   //   ex: "com.astx.KONVA2"
jsonStr = replaceAll(jsonStr,          // pkgName
                     `"${pkgName}"`,   //   ex: "Konva Sandbox I"
                     `"${pkgName}I"`); //   ex: "Konva Sandbox II"
log(`PERSISTENT TEST: HERE is the "pretty" jsonStr (after id changes):\n`, jsonStr);

// rehydrate the JSON back to a SmartPkg object
const rehydratedSmartPkg = SmartPkg.fromSmartJSON(JSON.parse(jsonStr));
log(`PERSISTENT TEST: HERE is the RE-HYDRATED smartPkg:\n`, {rehydratedSmartPkg});
