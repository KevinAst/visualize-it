<script>
 import DispErrDefault from './DispErr.svelte';
 import verify         from '../../verify.js';
 import {isString,
         isFunction}   from '../../typeCheck';
 import {onMount}      from 'svelte';
 import {get}          from './catalog';
 
 // The `<FieldErr>` component dynamically displays a field-specific
 // message when the field it is monitoring is invalid.
 // 
 // `<FieldErr>` auto-wires itself to the field of interest through a dynamic association
 // managed by svelte-native-forms actions.  This is accomplished through
 // the one of the following:
 //  1. `forName`: when supplied, field wiring occurs through the field name (as defined by SNF)
 //  2. implicit wiring: absent a `forName` property,
 //     the field wiring is implicitly accomplished through a DOM containment relationship,
 //     where the field and `<FieldErr>` are both nested in a `<label>` element.
 //     This is similar to how `<input>` elements can be implicitly associated to their `<label>`.
 //     For example:
 //       <label>
 //         Name:
 //         <input id="name" name="name" type="text" required
 //                use:fieldChecker>
 //         <FieldErr/>
 //       </label>

 // INPUT: [forName]: optionally, the field name to monitor errors on (as defined by svelte-native-forms)
 export let forName = null;
 
 // INPUT: [DispErr]: the display component that renders the error - DEFAULTS to the standard internal error display component
 //                   ACCEPTS: errMsg property ... an empty string ('') represents NO error
 export let DispErr = DispErrDefault;
 
 // validate INPUT properties
 const check = verify.prefix(`<FieldErr> component property violation: `);
 // ... forName
 if (forName) {
   check(isString(forName), 'forName (when supplied) must be a string');
 }
 // ... DispErr (defaulted above)
 check(isFunction(DispErr),  'DispErr (when supplied) must be a Svelte Component');

 // monitor the reactive store that reflect's the field error of interest
 // ... an empty string ('') represents no error
 let fieldErrMsg;

 // our domWiringHook used in implicit wiring
 let domWiringHook;
 function getImplicitFieldChecker() {
   let errQualifier = '';
   // locate any <label> ancestor of <FieldErr>
   const labelAncestor = domWiringHook.closest('label');
   if (labelAncestor) {
     // locate the field node (with a `data-snf-key` attribute)
     const fieldNodes = labelAncestor.querySelectorAll('[data-snf-key]');
     if (fieldNodes.length === 0) {
       errQualifier = 'NO fieldNode (managed by use:fieldChecker) was contained in the <label> ancestor';
     }
     else if (fieldNodes.length > 1) {
       errQualifier = 'MULTIPLE fieldNodes (managed by use:fieldChecker) were found in the <label> ancestor';
     }
     else { // ... FOUND IT!!
       const fieldNode = fieldNodes[0];
       // console.log(`XX found fieldNode: `, fieldNode);
       const fieldChecker = get(fieldNode.dataset.snfKey);
       // console.log(`XX found fieldChecker: `, fieldChecker);
       return fieldChecker;
     }
   }
   else {
     errQualifier = 'NO <label> ancestor of <FieldErr> was found';
   }
   // NOT FOUND - generate error
   check(false, `UNSUCCESSFUL "implicit wiring" to the field of interest\nREASON: ${errQualifier}\n` +
                '1: either contain your field (managed by use:fieldChecker) and <FieldErr> in a <label>\n' +
                '2: or use the forName property to make the wiring explicit');
 }

 // wire up our reflective fieldErrMsg (once we are mounted)
 // NOTE: In Svelte, component mounts occur AFTER all svelte actions have executed!
 //       This makes it much easier to do our "Error Display Component" wiring,
 //       because we know our SNF FormChecker/FieldChecker has been pre-setup!!
 onMount(() => {
   // console.log(`XX FieldErr has been mounted`);
   // wire up based on: forName
   if (forName) {
     // locate any <form> ancestor of <FieldErr>
     const formAncestor = domWiringHook.closest('form');
     check(formAncestor, `cannot wire up field through forName '${forName}' ... REASON: NO <form> ancestor`);
     const formChecker = get(formAncestor.dataset.snfKey);
     check(formChecker, `cannot wire up field through forName '${forName}' ... REASON: the <form> ancestor is NOT managed by svelte-native-forms (it must must employ the use:formChecker directive)`);
     const fieldChecker = formChecker.getFieldCheckerByName(forName);
     check(fieldChecker, `cannot wire up field through forName '${forName}' ... REASON: there is NO field managed by that name`);
     fieldErrMsg = fieldChecker.getErrMsgStore(); // ... wiring complete
   }
   // implicit wiring
   else {
     const fieldChecker = getImplicitFieldChecker();
     fieldErrMsg = fieldChecker.getErrMsgStore(); // ... wiring complete
   }
 });
</script>

<!-- our domWiringHook used in implicit wiring -->
<i class="domWiringHook" bind:this={domWiringHook}/>

<!-- use our configurable component to display our errors, supplying it our reflective content -->
<svelte:component this={DispErr} errMsg={$fieldErrMsg}/>
