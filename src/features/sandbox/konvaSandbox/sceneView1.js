import Konva             from 'konva';

import * as generalComps from './generalComps';

import SmartView         from 'core/SmartView';
import Scene             from 'core/Scene';
import SmartComp         from 'core/SmartComp';

import {createLogger}   from 'util/logger';

// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** sceneView1 ... ').enable();


//************************************************************************************
//*** sceneView1: our first SmartView
//************************************************************************************

// specialty component TODO: ?? eventually replace with global toolbar
class ToggleDraggableScenesButton extends SmartComp { // ?? THINK I WANT THIS TO BE IN COLLAGE ONLY ??????????????????

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
    new ToggleDraggableScenesButton(),
  ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// our View
const sceneView1 = new SmartView({id: 'scene', name: 'Scene 1', scene: scene1});

export default sceneView1;
