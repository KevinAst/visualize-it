import SmartModel        from './SmartModel';
import SmartScene        from './SmartScene';
import Konva             from 'konva';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import {createLogger}    from 'util/logger';

// our internal diagnostic logger (normally disabled, but keep enabled for a while)
const log = createLogger('***DIAG*** <SmartView> ... ').enable();

/**
 * SmartView is a viewport in which scene(s) are displayed/visualized.
 * 
 * Derivations of the contained SmartScene will handle the specifics
 * of visualizing a single scene (Scene obj) or multiple scenes
 * (Collage obj).
 * 
 * In all cases, this visualization can be "displayed":
 *   - in-line:  within the "contained" HTML DOM container
 *   - external: using an external browser window
 * TODO: this MAY BE more of a run-time consideration (rather than
 *       specified/retained by constructor params driven by our editor)
 */
export default class SmartView extends SmartModel {

  /**
   * Create a SmartView.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this view.
   * @param {string} [name=id] - the human interpretable name of this
   * view (DEFAULT to id).
   * @param {SmartScene} scene - the scene visualized in this view
   * (can be a single scene (Scene obj) or multiple scenes (Collage
   * obj).
   */
  constructor({id, name, scene, ...unknownArgs}={}) {

    super({id, name});

    // validate SmartView() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);
    
    // ... id/name validated by base class

    // ... scene
    check(scene,                       'scene is required');
    check(scene instanceof SmartScene, 'scene must be a SmartScene instance');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
    
    // retain parameters in self
    this.scene = scene;
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['scene']];
  }

  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaStage, `${this.diagClassName()}.${method}() can only be invoked after mounting.`);
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
    // NOTE: this method does NOT require mounting, because it's contained scene masters the size!
    verify(size===undefined, `***ERROR*** ${this.diagClassName()}.size() can only be invoked as a getter (with no params) ... size is mastered in the scene, AND derived in the view.`);
    return this.scene.size(); // return current size (from our contained scene)
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
  // AI: OBSOLETE (based on current enableXxxMode() implementation)
  draggableScene(draggable) {
    // NOTE: checkMounted() is accomplished at the Scene level
    if (draggable===undefined) {     // getter:
      return this.scene.draggable(); // return boolean setting of our scene
    }
    else {                             // setter:
      this.scene.draggable(draggable); //   sets our scene
      return this;                     // return self (for chaining)
    }
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
    log(`mounting SmartView id: ${this.id}`);
    
    // create our stage where our scene will be mounted
    const {width, height} = this.size();
    this.konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width,
      height,
    });
    
    // mount our scene into this stage
    this.scene.mount(this.konvaStage, containingHtmlElm); // ... containingHtmlElm needed to dynamically resize collage

  }
}
SmartView.unmangledName = 'SmartView';
