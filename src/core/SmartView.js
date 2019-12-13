import verify    from 'util/verify';
import isString  from 'lodash.isstring';

/**
 * SmartView is an abstract base class representing the viewport in
 * which scene(s) are displayed/visualized.
 * 
 * Derivations of SmartView will handle the specifics of visualizing a
 * single scene (SceneView) or multiple scenes (CollageView).
 * 
 * In all cases, this visualization can be "displayed":
 *   - in-line:  within the "contained" HTML DOM container
 *   - external: using an external browser window
 * TODO: this MAY BE more of a run-time consideration (rather than
 *       specified/retained by constructor params driven by our editor)
 */
export default class SmartView {

  /**
   * Create a SmartView.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this view.
   * @param {string} [name=id] - The name of this view (DEFAULT to id).
   */
  constructor({id, name, ...unknownArgs}={}) {

    // validate SmartView() constructor parameters
    const check = verify.prefix(`${this.constructor.name}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');

    // ... name
    if (name) {
      check(isString(name), 'name (when supplied) must be a string');
    }

    // ... unrecognized named parameter
    const unknownArgKeys = Object.keys(unknownArgs);
    check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

    // ... unrecognized positional parameter
    check(arguments.length === 1,  'unrecognized positional parameters (only named parameters can be specified)');


    // retain parameters in self
    this.id   = id;
    this.name = name || id;
  }

  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaStage, `${this.constructor.name}.${method}() can only be invoked after mounting.`);
  }

  /**
   * Get self's size ... {width, height}.
   *
   * NOTE: Because view size is derived from it's contained scene(s), 
   *       you may only set the size within the scene object (where it is mastered).
   *
   * @returns {Size} our current size.
   */
  size(size) {
    throw new Error(`***ERROR*** SmartView pseudo-interface-violation: ${this.constructor.name}(id:${this.id}).size() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Get/set the draggable flag of our contained scene.
   *
   * @param {boolean} [draggable] - the optional setting that when
   * supplied will set the scene's draggability.
   *
   * @returns {boolean|self} for getter: the current draggable
   * setting of our contained scene, for setter: self (supporting
   * chainable setters).
   */
  draggableScene(draggable) {
    throw new Error(`***ERROR*** SmartView pseudo-interface-violation: ${this.constructor.name}(id:${this.id}).draggableScene() is an abstract method that MUST BE implemented!`);
  }


  /**
   * Mount the visuals of this view, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {HtmlElm} containingHtmlElm - The container of this view
   * (an HTML Element).
   */
  mount(containingHtmlElm) {
    throw new Error(`***ERROR*** SmartView pseudo-interface-violation: ${this.constructor.name}(id:${this.id}).mount() is an abstract method that MUST BE implemented!`);
  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
