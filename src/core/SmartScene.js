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
   * @param {int} width - the width of this scene (mastered in scene).
   * @param {int} height - the height of this scene (mastered in scene).
   */
  constructor({id,
               comps,
               width, // NOTE: we keep as width/height rather than size: {width, height} (for now) ... CONSISTANT with Konva.Stage API (not that that matters ... it is an internal)
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
    this._size = {width, height}; // NOTE: we use _size so as NOT to clash with size() method
  //this.x = 0; // ?? crude test to see offset (no longer supported in my SceneView)
  //this.y = 0; 

  }
  
  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaLayer, `${this.constructor.name}.${method}() can only be invoked after mounting.`);
  }

  /**
   * Get/Set self's size ... {width, height}.
   *
   * NOTE: Because the pallet size is mastered in the scene, it can be
   *       set here.  A view size is derived from it's contained scene(s).
   *
   * @param {Size} [size] - the optional size that when
   * supplied will set self's size.
   *
   * @returns {Size|self} for getter: our current size,
   * for setter: self (supporting chainable setters).
   */
  size(size) {
    // NOTE: this method does NOT require mounting, because SmartScene masters the size!
    if (size===undefined) {      // getter:
      return this._size;
    }
    else {                       // setter:
      this._size = {width: size.width, height: size.height}; // new copy for good measure
      return this;               // return self (for chaining)
    }
  }

  /**
   * Get/set our draggable scene flag.
   *
   * @param {boolean} [draggable] - the optional setting that when
   * supplied will set the scene's draggability.
   *
   * @returns {boolean|self} for getter: our current draggable
   * setting, for setter: self (supporting chainable setters).
   */
  draggable(draggable) {
    this.checkMounted('draggable');
    if (draggable===undefined) {          // getter:
      return this.konvaLayer.draggable(); // return boolean setting
    }
    else {                                  // setter:
      this.konvaLayer.draggable(draggable); // set internal object
      return this;                          // return self (for chaining)
    }
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
    this.konvaLayer = new Konva.Layer({
      x,
      y,
    });

    // mount our components into this layer
    this.comps.forEach( (comp) => comp.mount(this.konvaLayer) );

    // wire our layer into the supplied containingKonvaStage
    // ... NOTE: This must be added AFTER the layer is populated :-(
    //           UNSURE WHY: seems like a Konva limitation :-(
    containingKonvaStage.add(this.konvaLayer)
  }

  //? persistenceMethods() {
  //? }
}
