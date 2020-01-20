import Konva             from 'konva';
import PseudoClass       from './PseudoClass';
import SmartScene        from './SmartScene';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * Scene is a SmartScene derivation that models a single Scene to be
 * displayed/visualized.
 *
 * A Scene represents a graphical perspective that visualizes a system
 * (either in part or whole).
 *
 * - a scene contains visual components, arranged in a way that
 *   resembles a system
 *
 * - a scene can DIRECTLY mange it's x/y properties (this is used in
 *   the context of a Collage, where multiple scenes are offset within
 *   a viewport).
 *   ?? REFACTOR: use pure scenes after refactor of scenes to accept x/y (see below)
 *
 * - a scene DIRECTLY manges the width/height properties
 *
 * - different scenes may visualize various aspects of a system (for
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
 *
 * **NOTE**: Scene objects are pseudoClasses.  In other words Scene
 *           instances are considered logical types.  Take for example
 *           `Foo`: a Scene instance with an id of `Foo`.  The master
 *           `Foo` object can be defined and edited, however `Foo`
 *           instances (copies of the `Foo` object) may be may created
 *           and referenced many times within the various Collages.
 */
export default class Scene extends SmartScene {

  /**
   * Create a Scene.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this scene.
   * @param {string} [name=id] - the human interpretable name of this
   * scene (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   *
   * @param {SmartComp[]} comps - the set of components (SmartComp) that 
   * make up this scene (logically our display list).
   *
   *   TODO: ?? REFACTOR: use pure scenes after refactor of scenes to accept x/y (see below)
   * @param {int} [x=0] - the optional x offset of this scene within it's container (used by Collage container - managing multiple Scenes)
   * @param {int} [y=0] - the optional y offset of this scene within it's container (used by Collage container - managing multiple Scenes)
   *
   * @param {int} width - the width of this scene (mastered in scene).
   * @param {int} height - the height of this scene (mastered in scene).
   */
  constructor({id,
               name,
               comps,
               _size, // INTERNAL USE (for rehydration) takes precedence over width/height: _size: {width, height}
               width, // NOTE: we keep as width/height rather than size: {width, height} (for now) ... CONSISTENT with Konva.Stage API (not that that matters ... it is an internal)
               height,
               ...unknownArgs}={}) {

    super({id, name});

    // validate Scene() constructor parameters
    const check = verify.prefix(`${this.constructor.name}() constructor parameter violation: `);

    // ... id/name validated by base class

    // ... comps
    check(comps,                'comps is required');
    check(Array.isArray(comps), 'comps must be a SmartComp[] array');

    // ... INTERNAL USE (for rehydration) takes precedence over width/height: _size: {width, height}
    if (_size) { 
      width  = _size.width;
      height = _size.height;
    }

    // ... width
    check(width,                   'width is required');
    check(Number.isInteger(width), `width must be an integer, NOT: ${width}`);
    check(width>0,                 `width must be a positive integer, NOT: ${width}`);

    // ... height
    check(height,                   'height is required');
    check(Number.isInteger(height), `height must be an integer, NOT: ${height}`);
    check(height>0,                 `height must be a positive integer, NOT: ${height}`);

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    //***
    //*** maintain self state (instance vars)
    //***

    // Scene objects are pseudoClasses (see NOTE above)
    this.pseudoClass = new PseudoClass();

    // retain parameters in self
    this._size = {width, height}; // NOTE: we use _size so as NOT to clash with size() method
    this.comps = comps;
  }

  // support persistance by encoding needed props of self
  // 
  // $FOLLOW-UP$: refine getEncodingProps() to support BOTH persistence (toSmartJSON()) -AND- pseudoClass construction (smartClone())
  //              ... see: "NO WORK (I THINK)" in journal (1/20/2020)
  //              We may need to interpret different usages in support of BOTH:
  //                - persistence (toSmartJSON()) -AND-
  //                - pseudoClass construction (smartClone())
  //              - may supply param: enum CloningType: forCloning/forJSON
  getEncodingProps() {

    // NOTE: in all cases, id/name handled by super

    // L8TR: see note above
    //? if (cloningType === CloningType.forCloning) {
    //?   return [...super.getEncodingProps(), ...['pseudoClass', '_size', 'comps']]; // ? if we do this, must handle pseudoClass in constructor params
    //? }
    //? else if (cloningType === CloningType.forJSON) {
    //? }

    // NOTE: currently pseudoClass is re-constituted via construction (above)
    //       and tweaked by SmartModel utils ... hmmm

    if (this.pseudoClass.isType()) { // the master TYPE DEFINITION persists EVERYTHING
      return [...super.getEncodingProps(), ...['_size', 'comps']];
    }
    else {                           // instances of this pseudoClass omit props that are part of the TYPE (will be re-constituted from master TYPE DEFINITION)
      return [...super.getEncodingProps(), ...['_size']];
    }
  }      
  
  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaLayer, `${this.constructor.name}.${method}() can only be invoked after mounting.`);
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
   */
  mount(containingKonvaStage, xPoop=0, yPoop=0) { // ?? x/y is OLD ... explicit x/y will eventually be obsoleted

    // ?? WITH OTHER REFACTOR x/y should be in contained in self ... i.e. this.x, this.y
    // ?? temp for now
    const x = xPoop;
    const y = yPoop;

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
    // NOTE: this method does NOT require mounting, because Scene masters the size!
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

}
