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
   */
  constructor({id, name, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartScene() constructor parameters
    const check = verify.prefix('SmartScene() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
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

  //? persistenceMethods() {
  //? }
}
SmartComp.unmangledName = 'SmartComp';
