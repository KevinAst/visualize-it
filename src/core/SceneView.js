import SmartView      from './SmartView';
import SmartScene     from './SmartScene';
import Konva          from 'konva';
import verify         from 'util/verify';
import {createLogger} from 'util/logger';

// our internal diagnostic logger (normally disabled, but keep enabled for a while)
const log = createLogger('***DIAG*** <SceneView> ... ').enable();

/**
 * SceneView is a viewport (a SmartView derivation) in which a single
 * scene is displayed/visualized.
 */
export default class SceneView extends SmartView {

  /**
   * Create a SceneView.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this view.
   * @param {string} [name=id] - The name of this view (DEFAULT to id).
   * @param {SmartScene} scene - the scene visualized in this view.
   */
  constructor({id, name, scene, ...unknownArgs}={}) {
    super({id, name});

    // validate SceneView() constructor parameters
    const check = verify.prefix(`${this.constructor.name}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... scene
    check(scene,                       'scene is required');
    check(scene instanceof SmartScene, 'scene must be a SmartScene instance');

    // ... unrecognized named parameter
    const unknownArgKeys = Object.keys(unknownArgs);
    check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

    // ... unrecognized positional parameter
    check(arguments.length === 1,  'unrecognized positional parameters (only named parameters can be specified)');

    // retain derivation-specific parameters in self
    this.scene = scene;
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
    verify(size===undefined, `***ERROR*** ${this.constructor.name}.size() can only be invoked as a getter (with no params) ... size is mastered in the scene, AND derived in the view.`);
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
  draggableScene(draggable) {
    this.checkMounted('draggableScene');

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
  
    log(`mounting SceneView id: ${this.id}`);
  
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
    this.scene.mount(this.konvaStage);
  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
