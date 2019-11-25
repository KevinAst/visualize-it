/**
 * SmartComp is the abstract base class for all visualize-it
 * components.
 *
 * These are graphical representations of system components:
 *  - they bind to a data model (for visual affects and animation)
 *  - their graphics are atomically maintained and selectable (using Konva.Group)
 *    ... for example, the entire component is selectable
 */
export default class SmartComp {

  /**
   * Create a SmartComp.
   *
   * ?? **Please Note** this function uses named parameters.
   *
   * @param {string} id - The unique identifier of this component. ?? is there more?
   */
  constructor(id) {
    this.id = id;
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
