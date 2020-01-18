import SmartModel        from './SmartModel';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * PseudoClass maintains meta data that allows an object instance to
 * logically be considered a class (a pseudoClass).
 *
 * This is used for resource-based objects:
 *  - that can be dynamically edited (through the graphical editor)
 *  - and yet can be "instantiated" as items of other objects!
 * This last point is where the resource is taking on the roll of a
 * class ... i.e. there are instances of this class in other resources!
 *
 * Classes whose object instances can take on the roll of a
 * pseudoClass should instantiate a `pseudoClass` member of type
 * PseudoClass as follows:
 *
 * ```js
 * export default class MyClass extends SmartModel {
 *   constructor(...) {
 *     ...
 *     // make objects of this type pseudoClasses
 *     this.pseudoClass = new PseudoClass();
 *     ...
 *   }
 * }
 * ```
 *
 * All SmartModel utilities recognize this convention and support it.
 * As an example:
 *  - `SmartModel.createSmartObject(...)` will operate on either a
 *    real smart classes (SmartModel derivations) or pseudoClasses
 *  - ?? should we list list more?
 *
 * Objects instances that contain the pseudoClass member can be in one
 * of two states:
 * 
 * 1. **MASTER DEFINITION** of the pseudoClass: There is only one
 *    object instance of this type, and is what can be dynamically
 *    edited.
 *
 *    **INTERNAL NOTE** In this state:
 *     - the `container.pseudoClass.id === 'TYPE'`
 *     - the `container.id` will represent the pseudoClass type
 *
 * 2. **INSTANCE** of the pseudoClass: There can be many instances of
 *    the pseudoClass type.
 *
 *    **INTERNAL NOTE** In this state:
 *     - the `container.pseudoClass.id` will reference the pseudoClass type
 *
 * Currently there are two scenarios where pseudoClasses are used:
 *
 *  - a `DynamicComp` represents a component that can be edited and
 *    maintained in the visualize-it graphical editor.  Many
 *    `DynamicComp` master definitions can be created (each with their
 *    own pseudoClass type), each which can be instantiated many times
 *    in a visualize-it model.
 *
 *  - a `Scene` represents a graphical perspective that visualizes a
 *    system, but each Scene definition can be referenced many times
 *    within various `Collages`.
 */
export default class PseudoClass extends SmartModel {

  /**
   * Create a PseudoClass.
   *
   * **IMPORTANT NOTE**: The PseudoClass constructor parameters are
   * strictly used internally!  All client usages should rely on the
   * defaults for these parameters.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} [id='TYPE'] - the type reference for this pseudoClass.
   */
  constructor({id='TYPE', 
               name='the MASTER pseudoClass definition of type: ... see container.id', // NOTE: we need name when re-constituted, it is supplied from JSON (due to the defaulting nature of SmartModel
               ...unknownArgs}={}) {
    super({id, name});

    // validate SmartScene() constructor parameters
    const check = verify.prefix('SmartScene() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
  }

  // NOT NEEDED (my props are all contained in super)
  // getEncodingProps(): {
  //   return [...super.getEncodingProps(), ...['my', 'props', 'too']];
  // }
  
  /**
   * Return an indicator as to whether self represents a "type",
   * verses an "instance" of a type ... the opposite of
   * `isInstance()`.
   * 
   * @returns {boolean} `true` if self is a "type", false otherwise.
   */
  isType() { return this.id==='TYPE'; }

  /**
   * Return an indicator as to whether self represents an "instance"
   * of a type, verses a "type" ... the opposite of `isType()`.
   * 
   * @returns {boolean} `true` if self is an "instance" of a type,
   * false otherwise.
   */
  isInstance() { return !this.isType(); }

}
