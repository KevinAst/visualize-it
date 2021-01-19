<script>
 import {fade} from 'svelte/transition';

 // INPUT: [errMsg]: the error message to display (an empty string ('') represents no error)
 export let errMsg;
</script>


<!-- display error msg (if any) -->
{#if errMsg}
<span class="error" transition:fade>
  {errMsg}
</span>
{/if}


<style>
 .error {
   font-size:    80%;
   font-weight:  bold;
   font-style:   italic;
   color:        #900;
 }
</style>
