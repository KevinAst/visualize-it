import SmartModel        from './SmartModel';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import DispMode          from './DispMode';

/**
 * SmartComp is the abstract base class for all visualize-it
 * components.
 *
 * These are graphical representations of components found in a system:
 *
 *  - they bind to a data model (for visual affects and animation)
 *
 *  - their graphics are atomically managed (selection and transformation)
 *    ... using a single rooted Konva.Group
 *
 *  - NOTE: SmartComp is abstract requiring derivation (for code-based compPkgs)
 *          HOWEVER: there is a concrete derivation that supports 
 *                   dynamic-based resource-loaded compPkgs
 *                   (maintained by the visualize-it component editor)
 *  
 *                 SmartComp        ... abstract
 *             isA  ├── DynamicComp ... a concrete derivation for dynamic-based resource-loaded compPkgs
 *                  │                   ... managed by the visualize-it component editor
 *                  └── others      ... for code-based compPkgs
 */
export default class SmartComp extends SmartModel {

  /**
   * Create a SmartComp.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this component.
   * @param {string} [name=id] - the human interpretable name of this
   * component (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   *
   * @param {int} [x=0] - the optional x offset of this comp within it's container (used by Scene container - managing multiple SmartComps)
   * @param {int} [y=0] - the optional y offset of this comp within it's container (used by Scene container - managing multiple SmartComps)
   */
  constructor({id, name, x=0, y=0, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartComp() constructor parameters
    const check = verify.prefix('SmartComp() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... x
    check(Number.isInteger(x), `x must be an integer (when supplied), NOT: ${x}`);
    check(x>=0,                `x must be >=0 (when supplied), NOT: ${x}`);
    // ... y
    check(Number.isInteger(y), `y must be an integer (when supplied), NOT: ${y}`);
    check(y>=0,                `y must be >=0 (when supplied), NOT: ${y}`);
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.x     = x;
    this.y     = y;
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['x', 'y']];
  }

  /**
   * Return an indicator as to whether self supports the supplied `dispMode`.
   *
   * @param {DispMode} dispMode - the display mode to evaluate.
   *
   * @throws {boolean} true: can handle, false: not supported.
   */
  canHandleDispMode(dispMode) {
    return dispMode !== DispMode.edit; // by default, SmartComps cannot be edited
  }

  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   */
  enableViewMode() {
    // L8TR: do something when animate is supported
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // L8TR: do something when animate is supported
  }

  /**
   * Mount the visuals of this component, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Layer} containingKonvaLayer - The container of
   * this component (a Konva.Layer).
   */
  mount(containingKonvaLayer) {
    throw new Error(`***ERROR*** SmartComp pseudo-interface-violation: ${this.diagClassName()}(id:${this.id}).mount() is an abstract method that MUST BE implemented!`);
  }

}
SmartComp.unmangledName = 'SmartComp';
