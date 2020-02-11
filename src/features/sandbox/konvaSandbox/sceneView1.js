import Konva             from 'konva';

import * as generalComps from './generalComps';

import SmartView         from 'core/SmartView';
import Scene             from 'core/Scene';
import SmartComp         from 'core/SmartComp';

import {createLogger}   from 'util/logger';

//import {temporaryLibManagerHACK} from 'core/SmartModel'; // ?? very temp
import pkgManager from 'core/PkgManager'; // ?? find a more common place to do this

// ?? temporary ... see: temporaryLibManagerHACK
import SmartPkg    from 'core/SmartPkg';
import Collage     from 'core/Collage';
import PseudoClass from 'core/PseudoClass';
//import Scene       from 'core/Scene';
//import SmartComp   from 'core/SmartComp';
import SmartScene  from 'core/SmartScene';
//import SmartView   from 'core/SmartView';



// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** sceneView1 ... ').enable();


//************************************************************************************
//*** sceneView1: our first SmartView
//************************************************************************************

// specialty component TODO: ?? eventually replace with global toolbar
class ToggleDraggableScenesButton1 extends SmartComp { // ?? CONSIDER: PLACING THIS IN COLLAGE ONLY (minor point as it will be obsoleted shortly)

  constructor() {
    super({id: 'trash1', name: 'trash1'});
  }

  mount(containingKonvaLayer) {
    const button = new Konva.Text({
      x: 20,
      y: 3,
      text: 'CLICK to Toggle Draggable Scenes',
      fill: 'blue',
    });
    button.on('click', (e) => {
      sceneView1.draggableScene( !sceneView1.draggableScene() );
      log(`draggableScene() 1 reset to: ${sceneView1.draggableScene()}`);
    });
    containingKonvaLayer.add(button);
  }
}

// our Scene
export const scene1 = new Scene({
  id: 'scene1',
  comps: [
    new generalComps.Valve1({id: 'myValve1'}),
    new generalComps.Valve2({id: 'myValve2'}),
    new generalComps.Valve3({id: 'myValve3'}),
    new ToggleDraggableScenesButton1(),
  ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// ?? very temporary till we have a library to manage this scene
//? temporaryLibManagerHACK['scene1'] = scene1;
//? temporaryLibManagerHACK['ToggleDraggableScenesButton1'] = ToggleDraggableScenesButton1;
// ?? can these be self-contained in the promoted SmartPkg?
pkgManager.registerPkg( new SmartPkg({
  id:   'sceneView1',
  name: 'sceneView1 classes',
  entries: {
    sceneView1: [
      scene1,
      ToggleDraggableScenesButton1,
    ],
  },
}) );

// ?? more temporary: register core classes to avoid circular imports
//?temporaryLibManagerHACK['SmartPkg']    = SmartPkg;
//?temporaryLibManagerHACK['Collage']     = Collage;
//?temporaryLibManagerHACK['PseudoClass'] = PseudoClass;
//?temporaryLibManagerHACK['Scene']       = Scene;
//?temporaryLibManagerHACK['SmartComp']   = SmartComp;
//?temporaryLibManagerHACK['SmartScene']  = SmartScene;
//?temporaryLibManagerHACK['SmartView']   = SmartView;
// ?? find a more common place to do this
pkgManager.registerPkg( new SmartPkg({
  id:   'core',
  name: 'core classes',
  entries: {
    core: [
      Collage,
      PseudoClass,
      Scene,
      SmartComp,
      // SmartModel, NOT: an abstract class (prob wouldn't hurt to registerPkg)
      SmartPkg,
      SmartScene,
      SmartView,
    ],
  },
}) );


// our View
const sceneView1 = new SmartView({id: 'scene', name: 'Scene 1', scene: scene1});

export default sceneView1;
