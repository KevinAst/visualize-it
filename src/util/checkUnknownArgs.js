/**
 * A convenience assertion validation utility that performs checks
 * related to "Unknown Arguments" of functions accepting "named
 * arguments".  This logic is encapsulated here because it a
 * repetitive requirement by many functions :-)
 * 
 * When any "Unknown Arguments" are detected, an exception is thrown
 * with a message containing context through the supplied `check`
 * parameter.
 * 
 * USAGE: 
 * ```js
 * myFunc({id, name, ...unknownNamedArgs}={}) {
 * 
 *   // validate myFunc() parameters
 *   const check = verify.prefix(`myFunct({id:'${id}', name:'${name}'}) parameter violation: `);
 *   
 *   // ... id
 *   check(id,             'id is required');
 *   check(isString(id),   'id must be a string');
 *   
 *   // ... name
 *   check(name,           'name is required');
 *   check(isString(name), 'name must be a string');
 * 
 *   // ... unknown arguments
 *   checkUnknownArgs(check, unknownNamedArgs, arguments);
 * }
 * ```
 *
 * @param {verifyFn} check - the verify assertion utility function,
 * typically prefixed with `verify.prefix()` to give proper context
 * to emitted exceptions.
 *
 * @param {string[]} unknownNamedArgs - an array of unknown named
 * argument named, typically supplied using ES6 "rest parameters".
 * 
 * @param {argsObj} args - the implicit `arguments` object
 * (accessible within standard JavaScript functions).
 * 
 * @throws {Error} an Error is thrown when any "Unknown Arguments" are
 * detected.
 */
export default function checkUnknownArgs(check, unknownNamedArgs, args) {

  // check for any unrecognized named parameters
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // check for any unrecognized positional parameter
  // NOTE: when defaulting entire struct, arguments.length is 0
  check(args.length <= 1,  `unrecognized positional parameters (only named parameters can be specified) ... ${args.length} arguments were supplied`);
}

/*

?? would be nice to add a check to determine if namedParams is a plain object

   feature-u check-in comment: adjusted createAspect() namedParam validation to produce more intuitive "positional param errors"
   ... see: c:/dev/feature-u/src/extend/createAspect.js

   1. our utility would accept an additional `namedParams` parameter:

        + checkUnknownArgs(check, args, namedParams, unknownNamedArgs): void ?? I reordered this too ?? AI rename checkUnknownArgs() TO: checkNamedParams()

      AND provide this additional check:

        check(isPlainObject(namedParams), `only named parameters may be supplied`);

   2. client should accept a single `namedParams` parameter
      and do the destructuring in an executable statement
      RATHER than the function signature.

      They would also move the checkUnknownArgs() up higher

      CLIENT EX:

      ```js
      myFunc(namedParams={}) {
      
        const {id, name, ...unknownNamedArgs} = namedParams;
      
        // ... unknown arguments ?? move this up
        // ... check named params ?? new name
        checkNamedParams(check, arguments, namedParams, unknownNamedArgs); // ?? new signature
      
        // validate myFunc() parameters
        const check = verify.prefix(`myFunct({id:'${id}', name:'${name}'}) parameter violation: `);
        
        // ... id
        check(id,             'id is required');
        check(isString(id),   'id must be a string');
        
        // ... name
        check(name,           'name is required');
        check(isString(name), 'name must be a string');
      }
      ```

    9: INTERNAL NOTE:

       I had originally tried to keep the destructuring in the function signature
       AND use JavaScript `arguments[0]` as the namedParams
       HOWEVER this has some BAD QUIRKS:

       NOTE: arguments is a bit tricky
             - it represents raw client-supplied args
             - WITHOUT default semantics (in signature destructuring)
                                                     arguments.length  arguments[0]  id (via signature destructuring)
                                                     ================  ============  =========
             - EX1: if client supplies NO params:           0            undefined   undefined
             - EX2: if client supplies (123)                1            123         undefined (TRICKY)
             - EX3: if client supplies (new Date())         1            Date        undefined (TRICKY)
             - EX4: if client supplies (123, 456)           2            123         undefined (TRICKY)
                    TRICKY: NOT SURE I fully understand this

             - SO: placement order of the checks below is critical
                   to get the desired message precedence to user
                   i.e. our ONE required param check IS DONE FIRST

*/
