import SmartModel from 'core/SmartModel';
import SmartView  from 'core/SmartView';
import Collage    from 'core/Collage';

import {scene1}  from './sceneView1';
import {scene2}  from './sceneView2';

//**********************************************************
//*** collageView1: our first collage-based SmartView
//**********************************************************


// create an instance of type scene1
const scene1Copy = SmartModel.createSmartObject(scene1, {
  id: 'scene1Copy',
  //? comps: [ // ?? do NOT think we need comps ... should be cloned from scene1 pseudoClass
  //?          new generalComps.Valve1({id: 'myValve1'}),
  //?          new generalComps.Valve2({id: 'myValve2'}),
  //?          new generalComps.Valve3({id: 'myValve3'}),
  //?          new ToggleDraggableScenesButton(),
  //? ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// create an instance of type scene2
console.log(`?? here is our scene2 master pseudoClass: `, {scene2});
const scene2Copy = SmartModel.createSmartObject(scene2, {
  id: 'scene2Copy',
  //? comps: [ // ?? do NOT think we need comps ... should be cloned from scene2 pseudoClass
  //?   new generalComps.Valve1({id: 'myValve1'}),
  //?   new generalComps.Valve2({id: 'myValve2'}),
  //?   // new generalComps.Valve3({id: 'myValve3'}), // omit JUST to make it different
  //?   new ToggleDraggableScenesButton(),
  //? ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// ?? CRUDE TEST: try to encode/hydrate scene2Copy
const json = scene2Copy.toSmartJSON();
console.log(`?? converted scene2Copy to JSON: `, {scene2Copy, json});
const scene2CopyCopy = SmartModel.fromSmartJSON(json);
console.log(`?? here is the scene2CopyCopy: `, {scene2CopyCopy});

const collageView1 = 
  new SmartView({id: 'collage1', name: 'Collage 1', // ?? is it OK to have same id for view/scene ... would be nice to allow this (I think)
                 scene: new Collage({id: 'collage1', name: 'Collage 1', scenes: [
                   {scene: scene1Copy, pos: {x:0,   y:0}},   // ??? retrofit this to be JUST scene's with their own x/y
                   {scene: scene2CopyCopy, pos: {x:300, y:250}}, // ... WowZee: to support this we need our clone() ... REALLY the pseudoClass create ... could temporarily manually dup the Scene
                 ]})
  });

export default collageView1;
