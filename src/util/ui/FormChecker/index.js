import FormChecker  from './FormChecker';
import FieldChecker from './FieldChecker';
import FieldErr     from './FieldErr.svelte';
import FormErr      from './FormErr.svelte';

/**
 * Promote the FormChecker public API.
 * 
 * USAGE:
 * 
 * ?? define complete usage (once we fully flesh it out)
 *
 * ?? THE FOLLOWING NOTE IS PROB TRUE FOR OUR "actions"
 * **NOTE**: The properties and API of the TabManager object are packaged in
 *           such a way as to allow them to be used in a functional way.
 *           In other words, the methods are bound to the object
 *           instance, allowing them to be used as isolated functions.
 */
export {
  FormChecker,  // the top-level FormChecker class
  FieldChecker, // the children  FieldChecker class

  FieldErr,     // the FieldErr component
  FormErr,      // the FormErr component
};
