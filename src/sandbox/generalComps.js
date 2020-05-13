import Konva          from 'konva';
import SmartComp      from '../core/SmartComp';
import SmartPkg       from '../core/SmartPkg';
import pkgManager     from '../core/pkgManager';

class Valve1 extends SmartComp {

  // eslint: no-useless-constructor
  // constructor(namedParams) {
  //   super(namedParams);
  // }

  // NOTE: this component demonstrates multi shapes grouped in a compGroup
  mount(containingKonvaLayer) {
    super.mount(containingKonvaLayer); // defines: this.compGroup

    const shape1 = new Konva.Rect({
      x: 10, // sub-shape location
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 5,
    });
    this.compGroup.add(shape1);

    const connector1 = new Konva.Circle({
      x: 5+2.5, // consider x/strokeWidth (above)
      y: 25,
      radius: 5,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 5,
    });
    this.compGroup.add(connector1);

    const connector2 = new Konva.Circle({
      x: 5+100+5, // consider x/width/strokeWidth (above)
      y: 25,
      radius: 5,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 5,
    });
    this.compGroup.add(connector2);

    // setup a sub-group JUST to insure (test) our algorithms can find/use the top-level group
    const subGroup = new Konva.Group({
      x: 0, // NOTE: cannot be based on this.x, RATHER a constant
      y: 0, //       BECAUSE this.compGroup reflects the transformation parameters (so we can't apply the transformations multiple times)
    });
    this.compGroup.add(subGroup);

    const subCircle = new Konva.Circle({
      x: 10+(100/2), // WHY no strokeWidth: +2.5
      y: 0+(50/2),   // WHY no strokeWidth: +2.5
      radius: 10,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1,
    });
    subGroup.add(subCircle);
  }
}
Valve1.unmangledName = 'Valve1';

class Valve2 extends SmartComp {

  // eslint: no-useless-constructor
  // constructor(namedParams) {
  //   super(namedParams);
  // }

  mount(containingKonvaLayer) {
    super.mount(containingKonvaLayer); // defines: this.compGroup

    const shape = new Konva.Rect({
      width: 100,
      height: 50,
      fill: 'red',
      shadowBlur: 10,
      cornerRadius: 10
    });
    this.compGroup.add(shape);
  }
}
Valve2.unmangledName = 'Valve2';

class Valve3 extends SmartComp {

  // eslint: no-useless-constructor
  // constructor(namedParams) {
  //   super(namedParams);
  // }

  mount(containingKonvaLayer) {
    super.mount(containingKonvaLayer); // defines: this.compGroup

    const shape = new Konva.Rect({
      width:  100,
      height: 100,
      fill: 'blue',
      cornerRadius: [0, 10, 20, 30]
    });
    this.compGroup.add(shape);
  }
}
Valve3.unmangledName = 'Valve3';

// our sandbox code-based component package
// ... registered in our sandbox feature appInit()
const generalCompsPkg = new SmartPkg({
  id:   'generalComps',
  name: 'SandBox Comps',
  entries: {
    "Class Comps": [
      Valve1,
      Valve2,
      Valve3,
    ],
  },
});

// register these components, supporting persistent file resolution
pkgManager.registerPkg(generalCompsPkg);
