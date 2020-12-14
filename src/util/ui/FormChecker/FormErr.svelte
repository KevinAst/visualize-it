<script>
 import {fade}  from 'svelte/transition';

 // INPUT: formChecker that we monitor form errors on
 export let formChecker;
 // ?? validate INPUTS

 // monitor the reactive store that reflect's the form error
 const formErrMsg = formChecker.getErrMsgStore();
</script>

{#if $formErrMsg} <!-- display form error msg (if any) -->
  <!-- ?? configuration opportunity ... utilize a default component that can be replaced by client    -->
  <!-- ?? can't really do <center> -and- ?? WHY do we need <br/> -->
  <center>
    <span class="formError" transition:fade>{$formErrMsg}</span>
    <br/><br/>
  </center>
{/if}


<!-- ?? styling ... really in component of "configuration opportunity" -->
<style>
 .formError {
   padding:          0.3em;
   font-size:        80%;
   color:            white;
   background-color: #900;
   border-radius:    5px;
   box-sizing:       border-box;
 }
</style>
