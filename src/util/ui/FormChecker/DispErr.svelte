<script>
 import {fade} from 'svelte/transition';

 // INPUT: [errMsg]: the error message to display (an empty string ('') represents no error)
 export let errMsg;
</script>


<!-- display error msg (if any) -->
{#if errMsg}
<div class="error" transition:fade>
  {errMsg}
</div>
{/if}


<style>
 .error {
   font-size:    80%;
   font-weight:  bold;
   font-style:   italic;
   color:        #900;
 }
</style>
