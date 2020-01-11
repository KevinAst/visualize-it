import Konva          from 'konva';
import SmartComp      from 'core/SmartComp';


export class Valve1 extends SmartComp {

  constructor({id, name}) {
    super({id, name});
  }

  mount(containingKonvaLayer) {
    const shape = new Konva.Rect({
      x: 20, // TODO: parameterize with defaults (needed for persistence)
      y: 20,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4
    });
    containingKonvaLayer.add(shape);
  }
}

export class Valve2 extends SmartComp {

  constructor({id, name}) {
    super({id, name});
  }

  mount(containingKonvaLayer) {
    const shape = new Konva.Rect({
      x: 150, // TODO: parameterize with defaults (needed for persistence)
      y: 40,
      width: 100,
      height: 50,
      fill: 'red',
      shadowBlur: 10,
      cornerRadius: 10
    });
    containingKonvaLayer.add(shape);
  }
}

export class Valve3 extends SmartComp {

  constructor({id, name}) {
    super({id, name});
  }

  mount(containingKonvaLayer) {
    const shape = new Konva.Rect({
      x: 50,  // TODO: parameterize with defaults (needed for persistence)
      y: 120,
      width: 100,
      height: 100,
      fill: 'blue',
      cornerRadius: [0, 10, 20, 30]
    });
    containingKonvaLayer.add(shape);
  }
}
