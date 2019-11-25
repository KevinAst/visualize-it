import Konva                from 'konva';

import SmartView            from 'core/SmartView';
import SmartScene           from 'core/SmartScene';
import SmartComp            from 'core/SmartComp';


//******************************************************************************
//*** draggableView: a SmartView demonstrating draggable views
//******************************************************************************


// TODO: consider moving this into some compLib/plumbing, driven through some catalog index
class Valve1 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  mount(container) {
    const shape = new Konva.Rect({
      x: 20, // TODO: parameterize with defaults (needed for persistence)
      y: 20,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4
    });
    container.add(shape);
  }
}

// TODO: move into compLib/plumbing ... define index.js semantics
class Valve2 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  mount(container) {
    const shape = new Konva.Rect({
      x: 150, // TODO: parameterize with defaults (needed for persistence)
      y: 40,
      width: 100,
      height: 50,
      fill: 'red',
      shadowBlur: 10,
      cornerRadius: 10
    });
    container.add(shape);
  }
}

// TODO: move into compLib/plumbing ... define index.js semantics
class Valve3 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  mount(container) {
    const shape = new Konva.Rect({
      x: 50,  // TODO: parameterize with defaults (needed for persistence)
      y: 120,
      width: 100,
      height: 100,
      fill: 'blue',
      cornerRadius: [0, 10, 20, 30]
    });
    container.add(shape);
  }
}


//******************************************************************************
// KJB: Here is my instantiated SmartScene/SmartView objects
//      NOTE 1: it is VERY light-weight UNTIL it is mounted!!
//      NOTE 2: KEY: This structure is 
//                   A. managed through our interactive editor,
//                      A1. need to monitor/sync these "edit" changes
//                      A2. because of "interactive editor", parameterization is minimal
//                   B. persisted as part of our "bundler"
//                   C. used at run-time through the "bundled" resources
//                      C1. don't think we need to monitor/sync any "animation" changes
//                          ... because this is NOT persisted

const scene = new SmartScene({
  id: 'draggableScene',
  comps: [
    new Valve1('myValve1'),
    new Valve2('myValve2'),
    new Valve3('myValve3'),
  ],
  width:  300,
  height: 250,
});

const draggableView = new SmartView('draggableView', scene);
//? draggableView.x = 30; // ?? crude test to see offset (no longer supported in my SmartView)
//? draggableView.y = 30;

export default draggableView;
