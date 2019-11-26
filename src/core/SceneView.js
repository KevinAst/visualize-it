import SmartView      from './SmartView';
import Konva          from 'konva';
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
   * @param {string} id - the unique identifier of this view.
   * @param {SmartScene} scene - the scene visualized in this view.
   */
  constructor(id, scene) {
    super(id);

    // retain derivation-specific parameters in self
    this.scene = scene;
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
    // TODO: ?? determine if this needs to be retained in self
    const konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width:     this.scene.width, // our size is defined within our scene
      height:    this.scene.height,
    });
  
    // mount our scene into this stage
    this.scene.mount(konvaStage);
  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
