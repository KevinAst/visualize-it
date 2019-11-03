import React from 'react';
import './App.css';            // ? obsolete once we have material-ui in place

import Konva               from 'konva';

import SmartViewReact      from 'util/SmartViewReact';
import SmartView           from 'core/SmartView';
import SmartComp           from 'core/SmartComp';


// our simple App component
export default () => (
  <div className="App">
    <header className="App-header">
      <img src="/visualize-it-logo.png" width="300" alt="Logo"/>
      <p>Your View into External Systems!</p>
      <img src="/visualize-it-logo-eyes.jpg" alt="Logo Eyes"/>
      <br/>
      <SmartViewReact view={myView1}/>
    </header>
  </div>
);

// TODO: move into compLib/plumbing ... define index.js semantics
class Valve1 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  manifest(container) {
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

  manifest(container) {
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

  manifest(container) {
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
// KJB: Here is my instantiated SmartView object
//      NOTE 1: it is VERY light-weight UNTIL it is manifest!!
//      NOTE 2: KEY: This structure is 
//                   A. managed through our interactive editor,
//                      A1. need to monitor/sync these "edit" changes
//                      A2. because of "interactive editor", parameterization is minimal
//                   B. persisted as part of our "bundler"
//                   C. used at run-time through the "bundled" resources
//                      C1. don't think we need to monitor/sync any "animation" changes
//                          ... because this is NOT persisted
const myView1 = new SmartView('myView1', [
  new Valve1('myValve1'),
  new Valve2('myValve2'),
  new Valve3('myValve3'),
]);
myView1.x = 30; // ?? crude for now
myView1.y = 30;
