<script>
 import DispErrField  from './DispErrField.svelte';
 import verify        from '../../verify.js';
 import {isFunction}  from '../../typeCheck';

 // INPUT: fieldChecker: the FieldChecker object to monitor errors on
 export let fieldChecker;

 // INPUT: [DispErr]: the display component that renders the error - DEFAULTS to the standard field-based error component
 export let DispErr = DispErrField;

 // validate INPUT properties
 const check = verify.prefix(`<FieldErr> component INPUT property violation: `);
 // ... fieldChecker
 check(fieldChecker,         'fieldChecker is required');
 check(fieldChecker.getForm, 'fieldChecker must be a FieldChecker instance'); // ... duck type check
 // ... DispErr
 check(isFunction(DispErr),  'DispErr (when supplied) must be a Svelte Component');

 // monitor the reactive store that reflect's the field error of interest
 // ... an empty string ('') represents no error
 const fieldErrMsg = fieldChecker.getErrMsgStore();
</script>


<!-- use our configurable component to display our errors, supplying it our reflective content -->
<svelte:component this={DispErr} errMsg={$fieldErrMsg}/>
