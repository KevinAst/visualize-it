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
 * (accessable within standard JavaScript functions).
 * 
 * @throws {Error} an Error is thrown when any "Unknown Arguments" are
 * detected.
 */
export default function checkUnknownArgs(check, unknownNamedArgs, args) {

  // check for any unrecognized named parameters
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // check for any unrecognized positional parameter
  check(args.length <= 1,  `unrecognized positional parameters (only named parameters can be specified) ... ${args.length} arguments were supplied`);
}
