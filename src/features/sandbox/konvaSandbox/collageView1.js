import SmartView  from 'core/SmartView';
import Collage    from 'core/Collage';

import {scene1}  from './sceneView1';
import {scene2}  from './sceneView2';

//**********************************************************
//*** collageView1: our first collage-based SmartView
//**********************************************************

const collageView1 = 
  new SmartView({id: 'collage1', name: 'Collage 1', // ?? is it OK to have same id for view/scene ... would be nice to allow this (I think)
                 scene: new Collage({id: 'collage1', name: 'Collage 1', scenes: [
                   {scene: scene1, pos: {x:0,   y:0}},   // ??? retrofit this to be JUST scene's with their own x/y
                   {scene: scene2, pos: {x:300, y:250}}, // ... WowZee: to support this we need our clone() ... REALLY the pseudoClass create ... could temporarily manually dup the Scene
                 ]})
  });

export default collageView1;
