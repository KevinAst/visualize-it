import Konva             from 'konva';

import * as generalComps from './generalComps';

import SceneView         from 'core/SceneView';
import SmartScene        from 'core/SmartScene';
import SmartComp         from 'core/SmartComp';

import {createLogger}   from 'util/logger';

// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** sceneView2 ... ').enable();


//************************************************************************************
//*** sceneView2: our first SceneView
//************************************************************************************

// specialty component TODO: ?? eventually replace with global toolbar
class ToggleDraggableScenesButton extends SmartComp {

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

// our Scene
export const scene2 = new SmartScene({
  id: 'aScene',
  comps: [
    new generalComps.Valve1('myValve1'),
    new generalComps.Valve2('myValve2'),
 // new generalComps.Valve3('myValve3'), // omit JUST to make it different
    new ToggleDraggableScenesButton('myButton'),
  ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// our View
const sceneView2 = new SceneView('sceneView2', scene2);
//? sceneView2.x = 30; // ?? crude test to see offset (no longer supported in my SceneView)
//? sceneView2.y = 30;

export default sceneView2;
