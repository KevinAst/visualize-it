<script>
 import {fade} from 'svelte/transition';

 // INPUT: [errMsg]: the generalized form-based error message (an empty string ('') represents no error)
 export let errMsg;
</script>


<!-- display error msg (if any) -->
{#if errMsg}
  <span class="formError" transition:fade>
    {errMsg}
  </span>
{/if}


<style>
 .formError {
   font-size:    80%;
   font-weight:  bold;
   color:        #900;
 }
</style>
