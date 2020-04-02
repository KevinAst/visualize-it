import SmartModel        from './SmartModel';
import SmartPallet       from './SmartPallet';
import Konva             from 'konva';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import {createLogger}    from 'util/logger';

// our internal diagnostic logger (normally disabled, but keep enabled for a while)
const log = createLogger('***DIAG*** <SmartView> ... ').enable();

/**
 * SmartView is a viewport in which pallet(s) are displayed/visualized.
 * 
 * Derivations of the contained SmartPallet will handle the specifics
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
   * @param {SmartPallet} pallet - the pallet visualized in this view
   * (can be a single scene (Scene obj) or multiple scenes (Collage
   * obj).
   */
  constructor({id, name, pallet, ...unknownArgs}={}) {

    super({id, name});

    // validate SmartView() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);
    
    // ... id/name validated by base class

    // ... pallet
    check(pallet,                        'pallet is required');
    check(pallet instanceof SmartPallet, 'pallet must be a SmartPallet instance');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
    
    // retain parameters in self
    this.pallet = pallet;

    // maintain our "view" containment tree parentage
    this.pallet.setViewParent(this);
  }

  // support persistance by encoding needed props of self
  // ... currently SmartView is NOT persisted
  //     - the persistance entry point is SmartPkg -to- SmartPallet (skipping SmartView)
  //     - however we support `getEncodingProps()` should it be needed
  //       ... either a smartClone() operation or future needs of persistence
  getEncodingProps(forCloning) {
    return [...super.getEncodingProps(forCloning), ...['pallet']];
  }

  // change isaView() to indicate we are SmartView instances
  isaView() {
    return true;
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
    // simply defer to our pallet size
    // ... use our pallet's sizeCache (no need for our own)
    return this.pallet.getSize();
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

    // create our stage where our pallet will be mounted
    const {width, height} = this.getSize();
    this.konvaStage = new Konva.Stage({
      container: containingHtmlElm,
      x:         0, // we assume an offset at the origin
      y:         0,
      width,
      height,
    });
    
    // mount our pallet into this stage
    this.pallet.mount(this.konvaStage);

    // regenerate actual size, once mounting is complete
    // ... propagate this request into our pallet
    this.pallet.trickleUpChange();
  }
}
SmartView.unmangledName = 'SmartView';
