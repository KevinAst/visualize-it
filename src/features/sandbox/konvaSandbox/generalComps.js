import Konva          from 'konva';
import SmartComp      from 'core/SmartComp';


export class Valve1 extends SmartComp {

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

export class Valve2 extends SmartComp {

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

export class Valve3 extends SmartComp {

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
