import Konva          from 'konva';
import {createLogger} from 'util/logger';

// our internal diagnostic logger (normally disabled, but keep enabled for a while)
const log = createLogger('***DIAG*** <SmartView> ... ').enable();

/**
 * SmartView is a base class representing the viewport in which
 * scene(s) are displayed/visualized.
 * 
 * In all cases, this visualization can be "displayed":
 *   - in-line:  within the "contained" HTML DOM container
 *   - external: using an external browser window
 * TODO: this MAY BE more of a run-time consideration (rather than
 *       specified/retained in our editor)
 */
export default class SmartView {

  /**
   * Create a SmartView.
   *
   * TODO: ?? eventually SmartView will be abstract, but for now it is concrete (mimicking FrameView - a single scene) 
   * TODO: ?? do we want to utilize named parameters (like SmartScene)
   *
   * @param {string} id - the unique identifier of this view.
   * @param {SmartScene} scene - the scene visualized in this view.
   */
  constructor(id, scene) {
    // retain parameters in self
    this.id    = id;
    this.scene = scene;
  }


  /**
   * Mount the visuals of this view, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {HtmlElm} htmlElm - The container of this scene (an HTML
   * Element).
   */
  mount(htmlElm) {

    log(`mounting SmartView id: ${this.id}`);

    // create our stage where our scene will be mounted
    // TODO: ?? determine if this needs to be retained in self
    const konvaStage = new Konva.Stage({
      container: htmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width:     this.scene.width, // our size is defined within our scene
      height:    this.scene.height,
    });

    // mount our scene into this stage
    this.scene.mount(konvaStage)
  }


  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }
}
