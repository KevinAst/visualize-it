import SmartView  from 'core/SmartView';
import Collage    from 'core/Collage';
import pkgManager from 'core/pkgManager';

//**********************************************************
//*** collageView1: our first collage-based SmartView
//**********************************************************


// create an instance of type scene1
const scene1ClassRef = pkgManager.getClassRef('sceneView1', 'scene1');
const scene1Copy     = scene1ClassRef.createSmartObject({
  id: 'scene1Copy',
  // comps: [ // KOOL: do NOT need comps ... they are created (cloned) from the scene1 pseudoClass!
  //          new generalComps.Valve1({id: 'myValve1'}),
  //          new generalComps.Valve2({id: 'myValve2'}),
  //          new generalComps.Valve3({id: 'myValve3'}),
  //          new ToggleDraggableScenesButton(),
  // ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// create an instance of type scene2
// console.log(`xx here is our scene2 master pseudoClass: `, {scene2});
const scene2ClassRef = pkgManager.getClassRef('sceneView2', 'scene2');
const scene2Copy     = scene2ClassRef.createSmartObject({
  id: 'scene2Copy',
  // comps: [ // KOOL: do NOT need comps ... they are created (cloned) from the scene2 pseudoClass!
  //   new generalComps.Valve1({id: 'myValve1'}),
  //   new generalComps.Valve2({id: 'myValve2'}),
  //   // new generalComps.Valve3({id: 'myValve3'}), // omit JUST to make it different
  //   new ToggleDraggableScenesButton(),
  // ],
  width:  300, // ... see this setting pass through our process
  height: 250,
});

// our Collage
// ??$$ curious ... where is this named export used?
export const collage1 = new Collage({id: 'collage1', name: 'Collage 1', scenes: [
  {scene: scene1Copy, pos: {x:0,   y:0}},
  {scene: scene2Copy, pos: {x:300, y:250}},
]});

const collageView1 = new SmartView({id: 'collage1', name: 'Collage 1', scene: collage1}); // ?? is it OK to have same id for view/scene ... would be nice to allow this (I think)

// ??$$ curious ... where is this default export used?
export default collageView1;
