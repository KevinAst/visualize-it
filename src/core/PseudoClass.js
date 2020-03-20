import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import {isString,
        isClass}         from 'util/typeCheck';

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
 * All visualize-it utilities recognize this convention and support it.
 * As an example:
 *  - `SmartClassRef.createSmartObject(...)` will operate on either a
 *    real classes (SmartModel derivations) or pseudoClasses
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
 *     - the `container.pseudoClass.id` will reference the pseudoClass type name
 *     - the `container.pseudoClass.pseudoClassMaster` will reference the pseudoClassMaster
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
export default class PseudoClass {

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
               name='the MASTER pseudoClass definition of type: ... see container.id',
               ...unknownArgs}={}) {

    // validate constructor parameters
    const check = verify.prefix('PseudoClass() constructor parameter violation: ');

    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');

    // ... name
    check(name,           'name is required');
    check(isString(name), 'name must be a string');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.id   = id;
    this.name = name || id;
  }
  
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

  /**
   * Return an indicator as to whether the supplied `ref` is a
   * "logical" class (i.e. a pseudoClass MASTER) ... an object
   * instance that is logically treated as a class.
   *
   * @param {any} ref - the item to interpret.
   *
   * @returns {boolean} true: `ref` is a "logical" class (a
   * pseudoClass MASTER), false: `ref` is something else.
   */
  static isPseudoClassMaster(ref) {
    return ref.pseudoClass && ref.pseudoClass.isType();
  }

  /**
   * Return the class name of the supplied `clazz` (interpreting BOTH
   * real classes and pseudoClass MASTERS).
   *
   * NOTE: This utility is used when the client is reasoning about a
   *       raw `clazz`, NOT a classRef (SmartClassRef).
   *
   * @param {class | pseudoClassMASTER} clazz - the class to interpret
   * (either a real class or a pseudoClass MASTER).
   *
   * @returns {string} the class name of the supplied `clazz`.
   *
   * @throws {Error} an Error is thrown when the supplied clazz is invalid.
   */
  static getClassName(clazz) {

    // validate parameters
    const check = verify.prefix('PseudoClass.getClassName() parameter violation: ');
    // ... clazz
    check(clazz, 'clazz is required');

    // interpret a pseudo class MASTER (an object instance that is logically a class)
    if (this.isPseudoClassMaster(clazz)) {
      return clazz.id;
    }

    // interpret a real class name
    if (isClass(clazz)) {
      return clazz.unmangledName || clazz.name;
    }
    
    // otherwise supplied param is invalid
    else {
      check(false, 'clazz must be a real class or a pseudoClass MASTER');
    }
  }

}
PseudoClass.unmangledName = 'PseudoClass';
