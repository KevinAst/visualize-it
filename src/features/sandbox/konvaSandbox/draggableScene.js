import Konva             from 'konva';

import * as generalComps from './generalComps';

import SceneView         from 'core/SceneView';
import SmartScene        from 'core/SmartScene';
import SmartComp         from 'core/SmartComp';

import {createLogger}   from 'util/logger';

// our internal diagnostic logger (keep enabled)
const log = createLogger('***DIAG*** draggableScene ... ').enable();


//******************************************************************************
//*** viewTestingDraggableScene: a SmartView demonstrating draggable scenes
//******************************************************************************

//************************
// Specialized Components

class ToggleDraggableScenesButton extends SmartComp {

  mount(containingKonvaLayer) {
    const button = new Konva.Text({
      x: 20,
      y: 3,
      text: 'CLICK to Toggle Draggable Scenes',
      fill: 'blue',
    });
    button.on('click', (e) => { // TODO: CONSIDER (if needed): technique making this handler independent of the component class
      viewTestingDraggableScene.draggableScene( !viewTestingDraggableScene.draggableScene() ); // TODO: CONSIDER (if needed): if we had our parent scene reference, we could invoke it directly with NO global knowledge
      log(`draggableScene() 1 reset to: ${viewTestingDraggableScene.draggableScene()}`);
    });
    containingKonvaLayer.add(button);
  }
}


//************************
// Our scene/view objects

const scene = new SmartScene({
  id: 'draggableScene',
  comps: [
    new generalComps.Valve1('myValve1'),
    new generalComps.Valve2('myValve2'),
    new generalComps.Valve3('myValve3'),
    new ToggleDraggableScenesButton('myButton'),
  ],
  width:  300, // ?? see different numbers pass through (NO WORKY YET)
  height: 250,
});

export const viewTestingDraggableScene = new SceneView('viewTestingDraggableScene', scene);
//? viewTestingDraggableScene.x = 30; // ?? crude test to see offset (no longer supported in my SceneView)
//? viewTestingDraggableScene.y = 30;




//******************************************************************************
//*** viewTestingDraggableScene2: a SECOND SmartView demonstrating draggable scenes <<< VERY CRUDE TEST FOR NOW
//******************************************************************************

//************************
// Specialized Components

class ToggleDraggableScenesButton2 extends SmartComp {

  mount(containingKonvaLayer) {
    const button = new Konva.Text({
      x: 20,
      y: 3,
      text: 'CLICK to Toggle Draggable Scenes',
      fill: 'blue',
    });
    button.on('click', (e) => { // TODO: CONSIDER (if needed): technique making this handler independent of the component class
      viewTestingDraggableScene2.draggableScene( !viewTestingDraggableScene2.draggableScene() ); // TODO: CONSIDER (if needed): if we had our parent scene reference, we could invoke it directly with NO global knowledge
      log(`draggableScene() 2 reset to: ${viewTestingDraggableScene2.draggableScene()}`);
    });
    containingKonvaLayer.add(button);
  }
}


//************************
// Our scene/view objects

const scene2 = new SmartScene({
  id: 'draggableScene',
  comps: [
    new generalComps.Valve1('myValve1'),
    new generalComps.Valve2('myValve2'),
//  new generalComps.Valve3('myValve3'),
    new ToggleDraggableScenesButton2('myButton'),
  ],
  width:  400, // ?? see different numbers pass through (NO WORKY YET)
  height: 400,
});

export const viewTestingDraggableScene2 = new SceneView('viewTestingDraggableScene2', scene2);
