import verify            from 'util/verify';
import isString          from 'lodash.isstring';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * SmartModel is the abstract top-level base class for all visualize-it
 * objects.  A consistent interpretation is defined for:
 *  - id/name
 *  - various common APIs
 *    * ?? expand
 *  - various common utilities
 *    * ?? expand
 */
export default class SmartModel {

  /**
   * Create a SmartModel.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this object.
   * @param {string} [name=id] - the human interpretable name of this
   * object (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   */
  constructor({id, name, ...unknownArgs}={}) {

    // validate SmartModel() constructor parameters
    const check = verify.prefix(`${this.constructor.name}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');

    // ... name
    if (name) {
      check(isString(name), 'name (when supplied) must be a string');
    }

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.id   = id;
    this.name = name || id;
  }

}
