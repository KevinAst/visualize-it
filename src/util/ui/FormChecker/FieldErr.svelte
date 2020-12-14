<script>
 import {fade}  from 'svelte/transition';

 // INPUT: fieldChecker that we monitor field errors on
 export let fieldChecker;
 // ?? validate INPUTS

 // monitor the reactive store that reflect's the field error of interest
 const fieldErrMsg = fieldChecker.getErrMsgStore();
</script>

{#if $fieldErrMsg} <!-- display field error msg (if any) -->
  <!-- ??$$ configuration opportunity ... utilize a default component that can be replaced by client    -->
  <div class="fieldError" transition:fade>{$fieldErrMsg}</div>
{/if}


<!-- ?? styling ... really in component of "configuration opportunity" -->
<style>
 .fieldError {
   width:            100%;
   padding:          0.3em;
   font-size:        80%;
   color:            white;
   background-color: #900;
   border-radius:    0 0 5px 5px;
   box-sizing:       border-box;
 }
</style>
