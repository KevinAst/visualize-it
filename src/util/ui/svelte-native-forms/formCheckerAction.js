import FormChecker  from './FormChecker';

/**
 * The svelte action (for an html `<form>`), that establishes the
 * necessary DOM binding for our validation.
 *
 * **NOTE**: Please refer to the FormChecker class constructor for
 *           action parameter documentation (it's params are identical).
 */
export default function formCheckerAction(formNode, clientParams) {
  // instantiate our FormChecker controller instance
  const formChecker = new FormChecker(formNode, clientParams);

  // the formNode has been removed from the DOM
	function destroy() {
    // clear up our FormChecker controller instance
    // ... this will dynamically clean up our FormChecker
    formChecker.destroy();
  }

  // our return integrates into svelte action life cycle hooks
  return {destroy};
}
