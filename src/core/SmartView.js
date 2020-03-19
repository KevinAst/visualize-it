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

    // maintain our view parentage
    this.scene.setParentView(this);
  }

  // support persistance by encoding needed props of self
  getEncodingProps(forCloning) {
    return [...super.getEncodingProps(forCloning), ...['scene']];
  }

  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaStage, `${this.diagClassName()}.${method}() can only be invoked after mounting.`);
  }

  /**
   * Get self's size.
   *
   * @returns {Size} our current size: {width, height}
   */
  getSize() {
    // cached size takes precedence
    if (this.sizeCache) {
      return this.sizeCache;
    }

    // compute size
    // ... simply defer to our contained scene
    this.sizeCache = this.scene.getSize();

    return this.sizeCache;
  }

  /**
   * Perform any static binding of self's size change (such as HTML or
   * Konva bindings).
   *
   * @param {Size} oldSize - the previous size ... {width, height}.
   * @param {Size} newSize - the new size ... {width, height}.
   */
  bindSizeChanges(oldSize, newSize) {
    // sync size to our Konva.Stage
    this.konvaStage.size(newSize);
    this.konvaStage.draw();

    // sync size to our containingHtmlElm
    this.containingHtmlElm.style.width  = `${newSize.width}px`;
    this.containingHtmlElm.style.height = `${newSize.height}px`;
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
    
    // retain our containingHtmlElm
    this.containingHtmlElm = containingHtmlElm;

    // create our stage where our scene will be mounted
    const {width, height} = this.getSize();
    this.konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width,
      height,
    });
    
    // mount our scene into this stage
    this.scene.mount(this.konvaStage);

    // regenerate actual size, once mounting is complete
    // ... propogate this request into our scene
    this.scene.regenSizeTrickleUp();
  }
}
SmartView.unmangledName = 'SmartView';
