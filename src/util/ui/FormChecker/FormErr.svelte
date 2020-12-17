<script>
 import DispErrDefault from './DispErr.svelte';
 import verify         from '../../verify.js';
 import {isString,
         isFunction}   from '../../typeCheck';

 // INPUT: formChecker: the FormChecker object to monitor errors on
 export let formChecker;

 // INPUT: [errMsg]: the generalized form-based error message - DEFAULTS to 'Please correct the highlighted field errors'
 export let errMsg = 'Please correct the highlighted field errors';

 // INPUT: [DispErr]: the display component that renders the error - DEFAULTS to the standard internal error display component
 export let DispErr = DispErrDefault;

 // validate INPUT properties
 const check = verify.prefix(`<FormErr> component INPUT property violation: `);
 // ... formChecker
 check(formChecker,                      'formChecker is required');
 check(formChecker.registerFieldChecker, 'formChecker must be a FormChecker instance'); // ... duck type check
 // ... errMsg
 check(isString(errMsg),     'errMsg (when supplied) must be a string');
 // ... DispErr
 check(isFunction(DispErr),  'DispErr (when supplied) must be a Svelte Component');

 // monitor the reactive store that reflect's the form error
 const formErrMsgStore = formChecker.getErrMsgStore();
 // AI: ?? CONSIDER RETROFITTING our internal formChecker.getErrMsgStore() to a boolean (how we are currently using it)
 //     ... WAIT till it is more final (to insure the FORM errMsg definition at the component level is OK)

 // reflectively use the supplied errMsg ONLY when the form has errors
 // ... an empty string ('') represents no error
 $: formErrMsg = $formErrMsgStore ? errMsg : '';
</script>

<!-- use our configurable component to display our errors, supplying it our reflective content -->
<svelte:component this={DispErr} errMsg={formErrMsg}/>
<!-- AI: ?? consider passing fieldValues and fieldErrors to DispErr component -->
