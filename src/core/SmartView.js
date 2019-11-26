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
   * @param {string} id - the unique identifier of this view.
   */
  constructor(id, scene) {
    // retain parameters in self
    this.id = id;
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
