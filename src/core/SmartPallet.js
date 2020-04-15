import SmartModel        from './SmartModel';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * SmartPallet is an abstract base class representing the graphical
 * perspective that visualizes a system (either in part or whole).
 */
export default class SmartPallet extends SmartModel {

  /**
   * Create a SmartPallet.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this pallet.
   * @param {string} [name=id] - the human interpretable name of this
   * pallet (DEFAULT to id).
   */
  constructor({id, name, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartPallet() constructor parameters
    const check = verify.prefix('SmartPallet() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
  }

  /**
   * Get self's current size (dynamically calculated).
   *
   * @returns {Size} self's current size ... {width, height}.
   */
  getSize() {
    throw new Error(`***ERROR*** SmartPallet pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.getSize() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Perform any static binding of self's size change (such as HTML or
   * Konva bindings).
   *
   * @param {Size} oldSize - the previous size ... {width, height}.
   * @param {Size} newSize - the new size ... {width, height}.
   */
  bindSizeChanges(oldSize, newSize) {
    throw new Error(`***ERROR*** SmartPallet pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.bindSizeChanges() is an abstract method that MUST BE implemented!`);
  }

}
SmartPallet.unmangledName = 'SmartPallet';
