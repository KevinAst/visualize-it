import SmartView      from './SmartView';
import Konva          from 'konva';
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

    // calculate our width/height (accumulation of all our scenes)
    const {width, height} = this.scenes.reduce( (accum, sceneCtx) => {
      accum.width  = Math.max(accum.width,  sceneCtx.scene.pos.x + sceneCtx.scene.width);
      accum.height = Math.max(accum.height, sceneCtx.scene.pos.y + sceneCtx.scene.height);
      return accum;
    }, {width:0, height:0});
    this.width  = width;
    this.height = height;
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
    // TODO: ?? determine if this needs to be retained in self
    const konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width:     this.width, // our size is the accumulation of all our scenes
      height:    this.height,
    });
    
    // mount our scenes onto this stage
    this.scenes.forEach( (sceneCtx) => {
      sceneCtx.scene.mount(konvaStage, sceneCtx.pos.x, sceneCtx.pos.y);
    });

  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
