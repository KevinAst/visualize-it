<script context="module">
 import verify from 'visualize-it/util/verify.js';

 // function in our one-and-only <Notify/> component instance
 // ... maintained by <Notify/> life-cycle-hooks
 let _pushMsgOnSnackbar$comp;

 // pushMsgOnSnackbar(): our exposed programatic interface
 // ... accessed via: import {pushMsgOnSnackbar} from './Notify.svelte'
 export function pushMsgOnSnackbar(snackbarParams) {
   // verify the proper context
   verify(_pushMsgOnSnackbar$comp, 'pushMsgOnSnackbar() setup violation: a <Notify/> component is required to be instantated (at the app root)');

   // propogate request to our one-and-only <Notify/> component instance
   _pushMsgOnSnackbar$comp(snackbarParams);
 }
</script>

<script>
 import Kitchen     from '@smui/snackbar/kitchen';
 import {onMount}   from 'svelte';

 // our programmatic interface to the Snackbar kitchen
 // ... initialized via bind:this
 let kitchen;

 function pushMsgOnSnackbar$comp(snackbarParams) {
   kitchen.push(snackbarParams);
 }

 // maintain our external functional binding (when <Notify> is mounted)
 onMount(() => {
   // insure only one <Notify/> component
   verify(!_pushMsgOnSnackbar$comp, 'only ONE <Notify/> component should be instantated (at the app root)');

   // retain our external binding
   _pushMsgOnSnackbar$comp = pushMsgOnSnackbar$comp;

   // return function to invoke with unmounted
	 return () => _pushMsgOnSnackbar$comp = null;
 });
</script>

<Kitchen bind:this={kitchen}
         snackbar$leading={true}
         snackbar$timeoutMs={4000}
         dismiss$class="material-icons"/>
<!-- snackbar$leading:   grrr - can only set Snackbar position at <Kitchen> instantiation time -->
<!-- snackbar$timeoutMs: grrr - can only define timeout at <Kitchen> instantiation time (4000–10000) -->
<!-- dismiss$class:      configure the close/dismiss control to be the X icon ... FYI: SMUI injects any dismiss$ prefixed prop onto it's dissmiss IconButton -->

<style>
 /* control layout of the snackbar message text */
 :global(.mdc-snackbar__label) {
   white-space: pre-wrap; /* honor cr/lf breaks and overall spacing */
 }
</style>
