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
 *  - NOTE: SmartComp is abstract requiring derivation (for code-based compLibs)
 *          HOWEVER: there is a concrete derivation that supports 
 *                   dynamic-based resource-loaded compLibs
 *                   (maintained by the visualize-it component editor)
 *  
 *                 SmartComp        ... abstract
 *             isA  ├── DynamicComp ... a concrete derivation for dynamic-based resource-loaded compLibs
 *                  │                   ... managed by the visualize-it component editor
 *                  └── others      ... for code-based compLibs
 */
export default class SmartComp {

  /**
   * Create a SmartComp.
   *
   * @param {string} id - The unique identifier of this component.
   * @param {string} [name=id] - The name of this component (DEFAULT to id).
   */
  constructor(id, name) {
    this.id   = id;
    this.name = name || id;
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
    throw new Error(`***ERROR*** SmartComp pseudo-interface-violation: ${this.constructor.name}(id:${this.id}).mount() is an abstract method that MUST BE implemented!`);
  }

  //? persistenceMethods() {
  //? }
}
