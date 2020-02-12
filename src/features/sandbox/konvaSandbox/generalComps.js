import Konva          from 'konva';
import SmartComp      from 'core/SmartComp';

// import {temporaryLibManagerHACK} from 'core/SmartModel'; // ?? very temp
import pkgManager from 'core/PkgManager'; // ?? find a more common place to do this
import SmartPkg  from 'core/SmartPkg';

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
Valve1.unmangledName = 'Valve1';

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
Valve2.unmangledName = 'Valve2';

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
Valve3.unmangledName = 'Valve3';

// ?? very temporary till we have a library to manage this scene
//? temporaryLibManagerHACK['Valve1']     = Valve1;
//? temporaryLibManagerHACK['Valve2']     = Valve2;
//? temporaryLibManagerHACK['Valve3']     = Valve3;
// ?? can these be self-contained in the promoted SmartPkg?
pkgManager.registerPkg( new SmartPkg({
  id:   'generalComps',
  name: 'generalComps classes',
  entries: {
    generalComps: [
      Valve1,
      Valve2,
      Valve3,
    ],
  },
}) );
