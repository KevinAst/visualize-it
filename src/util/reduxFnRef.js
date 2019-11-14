/**
 * A function encoding technique which allows function references to be
 * visible in Redux DevTools.
 * 
 * As a general rule, redux recommends using plain serializable state within.
 * ... https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state
 * 
 * In some cases, however, the dynamics afforded by using functional state
 * (or react functional components) is extremely powerful.
 * 
 * If you are NOT relying on the ability to persist and rehydrate redux
 * state, you may wish to use functional state to gain additional
 * dynamics in advanced systems.
 * 
 * Functional state does in fact work, with the caveats mentioned above,
 * however one "quirkiness" is that functional state is completely
 * invisible in the Redux DevTools ... which can be rather confusing :-(
 * 
 * This simple wrapper, provides visibility of functions (and react
 * functional components) held within your redux store.
 * 
 * ```js
 * someState: {               // Redux DevTools
 *   field1: fn,              // completely hidden: it is functional, just confusing
 *   field2: fnRefEncode(fn), // visible as:        field2: {fnRef: "hidden in Redux DevTools"}
 * }
 * ```
 * 
 * When using this wrapper, don't forget to decode it ... for example
 * 
 * ```js
 * fnRefDecode(someState.field2)(); // invocation of encoded redux state function
 * ```
 */

export const fnRefEncode = (fn) => ({fn, fnRef: 'hidden in Redux DevTools'});

export const fnRefDecode = (fnRef) => fnRef.fn;
