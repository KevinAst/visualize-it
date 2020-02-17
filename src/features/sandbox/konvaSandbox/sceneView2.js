import Konva             from 'konva';

import * as generalComps from './generalComps';

import pkgManager        from 'core/pkgManager';
import Scene             from 'core/Scene';
import SmartComp         from 'core/SmartComp';
import SmartPkg          from 'core/SmartPkg';
import SmartView         from 'core/SmartView';

import {createLogger}    from 'util/logger';


// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** sceneView2 ... ').enable();


//************************************************************************************
//*** sceneView2: our first SmartView
//************************************************************************************

// specialty component TODO: ?? eventually replace with global toolbar
class ToggleDraggableScenesButton2 extends SmartComp { //  ?? CONSIDER: PLACING THIS IN COLLAGE ONLY (minor point as it will be obsoleted shortly)

  constructor() {
    super({id: 'trash2', name: 'trash2'});
  }

  mount(containingKonvaLayer) {
    const button = new Konva.Text({
      x: 20,
      y: 3,
      text: 'CLICK to Toggle Draggable Scenes',
      fill: 'blue',
    });
    button.on('click', (e) => {
      sceneView2.draggableScene( !sceneView2.draggableScene() );
      log(`draggableScene() 1 reset to: ${sceneView2.draggableScene()}`);
    });
    containingKonvaLayer.add(button);
  }
}
ToggleDraggableScenesButton2.unmangledName = 'ToggleDraggableScenesButton2';

// our Scene
const scene2 = new Scene({
  id: 'scene2',
  comps: [
    new generalComps.Valve1({id: 'myValve1'}),
    new generalComps.Valve2({id: 'myValve2'}),
 // new generalComps.Valve3({id: 'myValve3'}), // omit JUST to make it different
    new ToggleDraggableScenesButton2(),
  ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// register these components, supporting persistent file resolution
pkgManager.registerPkg( new SmartPkg({
  id:   'sceneView2',
  name: 'sceneView2 classes',
  entries: {
    sceneView2: [
      scene2,
      ToggleDraggableScenesButton2,
    ],
  },
}) );

// our View
const sceneView2 = new SmartView({id: 'scene2', name: 'Scene 2', scene: scene2});
// ??$$ redo
export default sceneView2;
