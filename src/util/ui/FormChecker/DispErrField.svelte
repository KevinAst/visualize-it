<script>
 import {fade} from 'svelte/transition';

 // INPUT: [errMsg]: the generalized field-based error message (an empty string ('') represents no error)
 export let errMsg;
</script>


<!-- display error msg (if any) -->
{#if errMsg}
  <div class="fieldError" transition:fade>
    {errMsg}
  </div>
{/if}


<style>
 .fieldError {
   font-size:    80%;
   font-weight:  bold;
   color:        #900;
 }
</style>
