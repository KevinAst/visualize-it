import verify            from 'util/verify';
import {isString,
        isObject,
        isPlainObject,
        isSmartObject,
        isFunction,
        isClass}         from 'util/typeCheck';

// INTERNAL NOTES:
//  1. It was originally thought we needed to handle the following params.
// 
//     The current design is believed to provide an improved API,
//     without the need for these params.
//     
//     This list documents WHY they are NOT needed:
//     - initialAccum: app-code passes in the traverseFn()/resume() on first invocation
//     - forCloning:   supplied by app-code <<< UNLESS we need it in some of our default handlers
//     - smartObj:     supplied by app-code in traverseFn()/resume()
// 
//  2. AI: L8TR: Do we ever need to short-circuit (BRANCH/TRAVERSAL) the
//               traversal (say searching for a single item)?
//               ... if so how?

/**
 * Setup a generic object-model traversal function (on behalf of a
 * given service) by registering a series of type handlers specific to
 * that service (supporting all types NOT just SmartObjects).
 *
 * All registered handlers have the same API:
 *   ```js
 *   + handleXyz(accum, resume, ref): accumAmalgamation
 *       - params:
 *         * `accum`:  the current accumulation (when of interest to client)
 *         * `resume`: an alias to the traverseFn (self's return),
 *                     used by the handler to interpret sub references of any type.
 *         * `ref`:    the `Xyz` reference value to interpret
 *       - return: accumAmalgamation - an accumulative amalgamation
 *                 (optionally when of interest to client)
 *   ```
 *
 * **Please Note** this function uses named parameters.
 * 
 * @param {string} onBehalfOf - a human interpretable string
 * identifying the client function employing this traversal.
 * 
 * @param {function} [handleNoRef] - a handler of NO ref (null,
 * undefined) ... DEFAULT: no-op (accum is unaltered)
 * 
 * @param {function} [handleArray] - a handler of arrays
 * ... DEFAULT: each array item recurse into our traversal (override WHEN you need an array connotation)
 * 
 * @param {function} handleSmartObj - a handler of SmartObjects (class-based object derivations of SmartModel)
 * 
 * @param {function} handlePlainObj - a handler of plain objects
 * 
 * @param {function} [handleClass] - a handler of classes/functions
 * ... DEFAULT: THROW ERROR (override when expected by client)
 * 
 * @param {function} [handleNonSmartObj] - a handler of NON SmartObjects (not plain and not smart)
 * ... DEFAULT: THROW ERROR (override when expected by client)
 * 
 * @param {function} handlePrimitive - a handler of primitives
 * 
 * @returns {function} traversal function that will correctly
 * interpret a supplied `ref`.  API:
 *   ```js
 *   + traverseFn(ref, accum): accumAmalgamation
 *   ```
 * NOTE: This return function is also supplied to each of the
 *       registered handlers (as the `resume` param).
 */
export default function smartTraversalSetup(handlers={}) {

  // setup our value-added handlers object (providing validation and injecting default behavior)
  handlers = setupHandlers(handlers);

  // define our internal `resume()`/`traverse()` function that interprets various type references in our containment tree
  // - this algorithm is needed to support additional types over and above smartObjs
  // - the algorithm is recursive, picking up all sub-references (with depth)
  // - ALL data types are recognized and handled through a series of type-specific handlers
  // RETURNS: the latest accumulation (optional)
  function resume(ref, accum) {

    // handle NO ref (null, undefined)
    if (ref===undefined || ref===null) {
      return handlers.handleNoRef(accum, resume, ref);
    }

    // handle arrays
    else if (Array.isArray(ref)) {
      return handlers.handleArray(accum, resume, ref);
    }

    // handle classes/functions
    else if (isClass(ref)) {
      return handlers.handleClass(accum, resume, ref);
    }

    // handle objects
    // ... various object types (see below)
    else if (isObject(ref)) {

      // handle SmartObjects (class-based object derivations of SmartModel)
      if (isSmartObject(ref)) {
        return handlers.handleSmartObj(accum, resume, ref);
      }

      // handle plain objects
      else if (isPlainObject(ref)) {
        return handlers.handlePlainObj(accum, resume, ref);
      }

      // handle other objects (not plain and not smart)
      else {
        return handlers.handleNonSmartObj(accum, resume, ref);
      }

    } // end of ... isObject()

    // handle primitives (string, number, boolean, etc.)
    else {
      return handlers.handlePrimitive(accum, resume, ref);
    }

  }

  // expose our traverseFn() ... same as resume()
  return resume;
}


//********************************************************************************************
//* internal helper **************************************************************************
//********************************************************************************************

// setup/return our value-added handlers object (providing validation and default behavior injection)
function setupHandlers(handlers) {

  // validate parameters
  const check = verify.prefix('smartTraversalSetup() parameter violation: ');

  // ... handlers
  check(isPlainObject(handlers), 'only named parameters may be supplied');

  // ... descturcture/default/validate the handlers sub-structure
  const {onBehalfOf,      // REQUIRED: string indicating the service/method this traversal is operating under (ex: 'getCrc()')
         handleNoRef=handleNoRefDefault,
         handleArray=handleArrayDefault,
         handleSmartObj,  // REQUIRED: may devise default in future (with usage)
         handlePlainObj,  // REQUIRED: may devise default in future (with usage)
         handleClass=handleClassDefault,
         handleNonSmartObj=handleNonSmartObjDefault,
         handlePrimitive, // REQUIRED
         ...unknownNamedArgs} = handlers;

  // ... onBehalfOf
  check(onBehalfOf,            'onBehalfOf is required');
  check(isString(onBehalfOf),  'onBehalfOf must be a string');

  // ... handleNoRef
  check(isFunction(handleNoRef), 'handleNoRef must be a function (when supplied)');

  // ... handleArray
  check(isFunction(handleArray), 'handleArray must be a function (when supplied)');

  // ... handleSmartObj
  check(handleSmartObj,             'handleSmartObj is required');
  check(isFunction(handleSmartObj), 'handleSmartObj must be a function');

  // ... handlePlainObj
  check(isFunction(handlePlainObj), 'handlePlainObj must be a function');

  // ... handleClass
  check(isFunction(handleClass), 'handleClass must be a function (when supplied)');

  // ... handleNonSmartObj
  check(isFunction(handleNonSmartObj), 'handleNonSmartObj must be a function (when supplied)');

  // ... handlePrimitive
  check(isFunction(handlePrimitive), 'handlePrimitive must be a function');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... unrecognized positional parameter
  //     NOTE: when defaulting entire struct, arguments.length is 0
  check(arguments.length <= 1, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

  // reconstitute/return our value-added handlers (with all our setup and default behavior)
  return {
    onBehalfOf,
    handleNoRef,
    handleArray,
    handleSmartObj,
    handlePlainObj,
    handleClass,
    handleNonSmartObj,
    handlePrimitive,
  };

}


//********************************************************************************
//* DEFAULT handlers *************************************************************
//********************************************************************************

function handleNoRefDefault(accum, resume, noRef) { // undefined/null
  // DEFAULT: no-op (accum is unaltered)
  return accum;
}

function handleArrayDefault(accum, resume, arrRef) {
  // DEFAULT: ... each array item recurse into our traversal (override WHEN you need an array connotation)
  return arrRef.reduce( (innerAccum, item) => resume(item, innerAccum), accum );
}

function handleClassDefault(accum, resume, classRef) {
  // DEFAULT: ... THROW ERROR (override when expected by client)
  throw new Error(`***ERROR*** ${this.onBehalfOf} traversal encountered reference of unsupported type - class or function: ${classRef.name} :-(`);
}

function handleNonSmartObjDefault(accum, resume, otherObjRef) { // class-based objects that are NOT SmartObjects ... CONSIDER (as needed) adding support for common objects like Date, etc
  // DEFAULT: ... THROW ERROR (override when expected by client)
  throw new Error(`***ERROR*** ${this.onBehalfOf} traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
}
