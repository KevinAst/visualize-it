import CollageView  from 'core/CollageView';

import {scene1}  from './sceneView1';
import {scene2}  from './sceneView2';

//**********************************************************
//*** collageView1: our first CollageView
//**********************************************************

const collageView1 = new CollageView('collageView1', [
  {scene: scene1, pos: {x:0,   y:0}},
  {scene: scene2, pos: {x:300, y:250}},
]);

export default collageView1;
