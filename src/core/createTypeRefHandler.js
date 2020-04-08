import verify            from 'util/verify';
import {isObject,
        isPlainObject,
        isSmartObject,
        isFunction,
        isClass}         from 'util/typeCheck';

/**
 * Generate `handleRefFn` with knowledge of how to handle **ALL** data
 * types for a given app-specific context.  This is accomplished by
 * registering a series of handlers (one for each data type).
 *
 * This is typically used in a SmartModel traversal, walking through
 * all the reference values within a containment tree (with depth).
 *
 * The API of the generated `handleRefFn` -AND- all app-specific
 * `handleXyz` functions are the same:
 *
 * ```js
 * + handleRefFn(ref, accum): accum
 * + handleXyz(ref, accum): accum
 *     - params:
 *       * `ref`:    the reference value to handle/interpret
 *       * `accum`:  the current accumulation (when of interest to client)
 *     - return: accum - an accumulative amalgamation (when of interest to client)
 * ```
 *
 * The only difference between the two APIs is context of the `ref` parameter:
 * - For the generated `handleRefFn`, the `ref` param is of ANY type.  
 *   This is the purpose of this generated function - to map the
 *   request to application handlers that are type-specific.
 * - For the app specific `handleXyz` the `ref` param is guaranteed to
 *   be of type `Xyz`.
 *
 * **Please Note** this function uses named parameters.
 * 
 * @param {function} handleNoRef - a handler of NO ref (null,
 * undefined)
 * 
 * @param {function} handlePrimitive - a handler of primitives
 * (string, number, etc.).
 * 
 * @param {function} handleArray - a handler of arrays
 * 
 * @param {function} handlePlainObj - a handler of plain objects
 * (object literals)
 * 
 * @param {function} handleSmartObj - a handler of SmartObjects
 * (class-based object derivations of SmartModel)
 * 
 * @param {function} handleNonSmartObj - a handler of NON
 * SmartObjects (not plain and not smart)
 * 
 * @param {function} handleClass - a handler of classes/functions
 * 
 * @returns {function} generated `handleRefFn` (see API in description
 * above).
 */
export default function createTypeRefHandler(handlers={}) {

  // setup/validate the handler object for this context
  // ... registering handlers for ALL data types
  handlers = setupHandlers(handlers);

  // generate our handleRefFn() for this application context
  function handleRefFn(ref, accum) {
    // handle NO ref (null, undefined)
    if (ref===undefined || ref===null) {
      return handlers.handleNoRef(ref, accum);
    }
    // handle arrays
    else if (Array.isArray(ref)) {
      return handlers.handleArray(ref, accum);
    }
    // handle classes/functions
    else if (isClass(ref)) {
      return handlers.handleClass(ref, accum);
    }
    // handle objects ... various object types (see below)
    else if (isObject(ref)) {
      // handle SmartObjects (class-based object derivations of SmartModel)
      if (isSmartObject(ref)) {
        return handlers.handleSmartObj(ref, accum);
      }
      // handle plain objects
      else if (isPlainObject(ref)) {
        return handlers.handlePlainObj(ref, accum);
      }
      // handle other objects (not plain and not smart)
      else {
        return handlers.handleNonSmartObj(ref, accum);
      }
    }
    // handle primitives (string, number, boolean, etc.)
    else {
      return handlers.handlePrimitive(ref, accum);
    }
  }

  // expose our generated handleRefFn()
  return handleRefFn;
}


//********************************************************************************************
//* internal helper **************************************************************************
//********************************************************************************************

// setup/validate the handler object for this context
// ... registering handlers for ALL data types
function setupHandlers(handlers) {

  // validate parameters
  const check = verify.prefix('createTypeRefHandler() parameter violation: ');

  // ... handlers
  check(isPlainObject(handlers), 'only named parameters may be supplied');

  // ... descturcture/validate the handlers sub-structure
  const {handleNoRef,
         handlePrimitive,
         handleArray,
         handlePlainObj,
         handleSmartObj,
         handleNonSmartObj,
         handleClass,
         ...unknownNamedArgs} = handlers;

  // ... handleNoRef
  check(handleNoRef,                   'handleNoRef is required');
  check(isFunction(handleNoRef),       'handleNoRef must be a function');

  // ... handlePrimitive
  check(handlePrimitive,               'handlePrimitive is required');
  check(isFunction(handlePrimitive),   'handlePrimitive must be a function');

  // ... handleArray
  check(handleArray,                   'handleArray is required');
  check(isFunction(handleArray),       'handleArray must be a function');

  // ... handlePlainObj
  check(handlePlainObj,                'handlePlainObj is required');
  check(isFunction(handlePlainObj),    'handlePlainObj must be a function');

  // ... handleSmartObj
  check(handleSmartObj,                'handleSmartObj is required');
  check(isFunction(handleSmartObj),    'handleSmartObj must be a function');

  // ... handleNonSmartObj
  check(handleNonSmartObj,             'handleNonSmartObj is required');
  check(isFunction(handleNonSmartObj), 'handleNonSmartObj must be a function');

  // ... handleClass
  check(handleClass,                   'handleClass is required');
  check(isFunction(handleClass),       'handleClass must be a function');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... unrecognized positional parameter
  //     NOTE: when defaulting entire struct, arguments.length is 0
  check(arguments.length <= 1, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

  // reconstitute/return our value-added handlers
  return {
    handleNoRef,
    handlePrimitive,
    handleArray,
    handlePlainObj,
    handleSmartObj,
    handleNonSmartObj,
    handleClass,
  };

}
