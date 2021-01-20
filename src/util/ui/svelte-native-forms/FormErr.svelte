<script>
 import DispErrDefault from './DispErr.svelte';
 import verify         from '../../verify.js';
 import {isString,
         isFunction}   from '../../typeCheck';
 import {onMount}      from 'svelte';
 import {get}          from './catalog';
 
 // The `<FormErr>` component dynamically displays a generalized
 // message when something is wrong with one or more form fields.  The
 // default message is: `Please correct the highlighted field errors`
 // but can easily be overwritten through the `errMsg` property.
 // 
 // `<FormErr>` must be a descendant of a `<form>` that is controlled
 // by a `formChecker` action.  This is how it implicitly auto-wires
 // itself to the form's error status.

 // INPUT: [errMsg]: the generalized form-based error message - DEFAULTS to 'Please correct the highlighted field errors'
 export let errMsg = 'Please correct the highlighted field errors';

 // INPUT: [DispErr]: the display component that renders the error - DEFAULTS to the standard internal error display component
 //                   ACCEPTS: errMsg property ... an empty string ('') represents NO error.
 export let DispErr = DispErrDefault;

 // validate INPUT properties
 const check = verify.prefix(`<FormErr> component property violation: `);
 // ... errMsg
 check(isString(errMsg),     'errMsg (when supplied) must be a string');
 // ... DispErr
 check(isFunction(DispErr),  'DispErr (when supplied) must be a Svelte Component');

 // monitor the reactive store that reflect's our form error status
 let isFormValid;

 // our domWiringHook used in implicit wiring
 let domWiringHook;
 function getImplicitFormChecker() {
   let errQualifier = '';

   // locate the <form> ancestor of <FormErr>
   const formAncestor = domWiringHook.closest('form');
   if (formAncestor) {
     // locate the <form>'s formChecker
     const formChecker = get(formAncestor.dataset.snfKey);
     if (formChecker) { // ... FOUND IT!!
       // console.log(`XX found formChecker: `, formChecker);
       return formChecker;
     }
     else {
       errQualifier = "the <form> ancestor is NOT managed by svelte-native-forms (it must must employ the use:formChecker directive)";
     }
   }
   else {
     errQualifier = 'NO <form> ancestor was found (<FormErr> MUST be a descendant of a <form> that is controlled by a formChecker action)';
   }

   // NOT FOUND - generate error
   check(false, `UNSUCCESSFUL "implicit wiring" to the <form> of interest ... REASON: ${errQualifier}`);
 }

 // reflectively use the supplied errMsg ONLY when the form has errors
 // ... an empty string ('') represents no error
 // ... NOTE: outer condition is REQUIRED to illiminate an "initial" error condition
 //           (at startup initialization before isFormValid is defined)
 $: formErrMsg = isFormValid ? ($isFormValid ? '' : errMsg) : '';

 // wire up our reflective fieldErrMsg (once we are mounted)
 // NOTE: In Svelte, component mounts occur AFTER all svelte actions have executed!
 //       This makes it much easier to do our "Error Display Component" wiring,
 //       because we know our SNF FormChecker/FieldChecker has been pre-setup!!
 onMount(() => {
   // console.log(`XX FormErr has been mounted`);
   // apply our implicit wiring
   const formChecker = getImplicitFormChecker();
   isFormValid = formChecker.getIsFormValidStore(); // ... wiring complete
 });
</script>

<!-- our domWiringHook used in implicit wiring -->
<i class="domWiringHook" bind:this={domWiringHook}/>

<!-- use our configurable component to display our errors, supplying it our reflective content -->
<svelte:component this={DispErr} errMsg={formErrMsg}/>
