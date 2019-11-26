import Konva     from 'konva';
import verify    from 'util/verify';
import isString  from 'lodash.isstring';

/**
 * SmartScene represents a graphical perspective that visualizes a system
 * (either in part or whole).
 *
 * - a scene contains visual components, arranged in a way that
 *   resembles a system
 *
 * - a scene DIRECTLY manges the width/height properties
 *
 * - multiple scenes may visualize different aspects of a system (for
 *   example a functional breakdown)
 *   * each scene INTERNALLY correlates to a separate Konva.Layer
 *
 * - FUTURE: support of user-defined functional layers:
 *   - scene may be further sub-divided into MULTIPLE functional layers
 *   - components of a scene will belong to one of these functional layers
 *     ... Quest: is this a direct containment, or some logical tagging?
 *   - this allows the visualization of these functional layers to be toggled on/off
 *
 * - FUTURE: Animation Consideration:
 *   - internally each scene (and their functional layers) is
 *     sub-divided into two Konva layers:
 *     - a static layer
 *     - an animation layer
 *     > NEEDS WORK: may want to do things in our static layer (like change component color)
 */
export default class SmartScene {

  /**
   * Create a SmartScene.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this scene.
   * @param {SmartComp[]} comps - the set of components (SmartComp) that 
   * make up this scene (logically our display list).
   * @param {int} width - the width of this scene.
   * @param {int} height - the height of this scene.
   */
  constructor({id,
               comps,
               width,
               height,
               ...unknownArgs}={}) {

    // validate SmartScene() constructor parameters
    const check = verify.prefix('SmartScene() constructor parameter violation: ');

    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');

    // ... comps
    check(comps,                'comps is required');
    check(Array.isArray(comps), 'comps must be a SmartComp[] array');

    // ... width
    check(width,                   'width is required');
    check(Number.isInteger(width), `width must be an integer, NOT: ${width}`);
    check(width>0,                 `width must be a positive integer, NOT: ${width}`);

    // ... height
    check(height,                   'height is required');
    check(Number.isInteger(height), `height must be an integer, NOT: ${height}`);
    check(height>0,                 `height must be a positive integer, NOT: ${height}`);

    // ... unrecognized named parameter
    const unknownArgKeys = Object.keys(unknownArgs);
    check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

    // ... unrecognized positional parameter
    check(arguments.length === 1,  'unrecognized positional parameters (only named parameters can be specified)');

    // retain parameters in self
    this.id     = id;
    this.comps  = comps;
    this.width  = width;
    this.height = height;
  //this.x = 0; // ?? crude test to see offset (no longer supported in my SceneView)
  //this.y = 0; 

  }

  /**
   * Mount the visuals of this scene, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Stage} containingKonvaStage - The container of
   * this scene (a Konva.Stage).
   * @param {int} [x=0] - the optional x offset of this scene within it's container
   * @param {int} [y=0] - the optional y offset of this scene within it's container
   */
  mount(containingKonvaStage, x=0, y=0) {

    // create our layer where our components will be mounted
    // TODO: ?? determine if this needs to be retained in self
    const konvaLayer = new Konva.Layer({

      // ?? crude test to determine that YES you can drag the entire layer
      //    - YOU CAN!
      //    - must drag one of it's object
      //    - UNSURE if this restricts individual objects from dragging?
      //    - ?? TODO: parameterize this so we can accomplish it at run-time through some api
      draggable: true,

      x,
      y,
    });

    // mount our components into this layer
    this.comps.forEach( (comp) => comp.mount(konvaLayer) );

    // wire our layer into the supplied containingKonvaStage
    // ... NOTE: This must be added AFTER the layer is populated :-(
    //           UNSURE WHY: seems like a Konva limitation :-(
    containingKonvaStage.add(konvaLayer)
  }

  //? persistenceMethods() {
  //? }
}
