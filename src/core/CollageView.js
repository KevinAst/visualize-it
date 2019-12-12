import SmartView      from './SmartView';
import Konva          from 'konva';
import verify         from 'util/verify';
import {createLogger} from 'util/logger';

// our internal diagnostic logger (normally disabled, but keep enabled for a while)
const log = createLogger('***DIAG*** <CollageView> ... ').enable();

/**
 * CollageView is a viewport (a SmartView derivation) in which multiple
 * scene is displayed/visualized.
 */
export default class CollageView extends SmartView {

  /**
   * Create a CollageView.
   *
   * @param {string} id - the unique identifier of this view.
   * @param {SomeSceneCtxArr} scenes - the scenes/position visualized by
   * this view.
   * SomeSceneCtxArr: `[ {scene, pos}, ... ]`, where pos is {x,y}
   * 
   */
  constructor(id, scenes) {
    super(id);

    // retain derivation-specific parameters in self
    this.scenes = scenes; // TODO: need mucho validation and/or a real SceneCtx structure
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

    // compute our size accumulated from all our scenes
    const viewSize = this.scenes.reduce( (accum, sceneCtx) => {
      const sceneSize = sceneCtx.scene.size();
      accum.width  = Math.max(accum.width,  sceneCtx.pos.x + sceneSize.width); 
      accum.height = Math.max(accum.height, sceneCtx.pos.y + sceneSize.height);
      return accum;
    }, {width:0, height:0});
    return viewSize;
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

    if (draggable===undefined) {               // getter:
      return this.scenes[0].scene.draggable(); // return boolean setting of our first scene (assumes it is synced)
    }
    else {                                  // setter: sets across all our scenes
      this.scenes.forEach( (sceneCtx) => sceneCtx.scene.draggable(draggable) );
      return this;                          // return self (for chaining)
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
    
    log(`mounting CollageView id: ${this.id}`);
    
    // create our stage where our scenes will be mounted
    const {width, height} = this.size();
    this.konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width,
      height,
    });
    
    // mount our scenes onto this stage
    this.scenes.forEach( (sceneCtx) => {
      sceneCtx.scene.mount(this.konvaStage, sceneCtx.pos.x, sceneCtx.pos.y);
    });

  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
