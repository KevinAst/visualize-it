import Konva             from 'konva';

import * as generalComps from './generalComps';

import pkgManager        from 'core/pkgManager';
import Scene             from 'core/Scene';
import SmartComp         from 'core/SmartComp';
import SmartPkg          from 'core/SmartPkg';
import SmartView         from 'core/SmartView';

import {createLogger}    from 'util/logger';

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
ToggleDraggableScenesButton1.unmangledName = 'ToggleDraggableScenesButton1';

// our Scene
const scene1 = new Scene({
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

// register these components, supporting persistent file resolution
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

// our View
const sceneView1 = new SmartView({id: 'scene', name: 'Scene 1', scene: scene1});
// ??$$ redo
export default sceneView1;
