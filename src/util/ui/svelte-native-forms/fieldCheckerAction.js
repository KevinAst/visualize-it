import FieldChecker  from './FieldChecker';

/**
 * The svelte action (for individual fields), that establishes the
 * necessary DOM binding for our validation.
 *
 * **NOTE**: Please refer to the FieldChecker class constructor for
 *           action parameter documentation (it's params are identical).
 */
export default function fieldCheckerAction(fieldNode, clientParams) {
  // instantiate our FieldChecker controller instance
  const fieldChecker = new FieldChecker(fieldNode, clientParams);

  // monitor changes to our action parameters
  // ... this is critical in detecting reflexive changes for clientParams.boundValue!!
  function update(clientParams) {
    fieldChecker.syncActionParamChanges(clientParams);
  }

  // the fieldNode has been removed from the DOM
	function destroy() {
    // clear up our FieldChecker controller instance
    // ... this will dynamically remove itself from our parent FormChecker
    fieldChecker.destroy();
  }

  // our return integrates into svelte action life cycle hooks
  return {update, destroy};
}
