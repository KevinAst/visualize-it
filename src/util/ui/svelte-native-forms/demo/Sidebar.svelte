<script>
 export let open = false

 function closeMe() {
   open = false;
 }

 const buttons = [];
 for(let i=0; i<20; i++){
   buttons.push(i+1);
 } 
</script>

<!-- KJB: ?? the Sidebar is LIMITED
          - the aside height is 223 px high <<< unclear where this is coming from: must be some default
          - the nav scrolls the whole page  <<< we need to use internal scrollers
          - in the interum I added the condition #if open (just so the page does not get too big
 -->
{#if open}
<aside class="absolute w-full h-full bg-gray-200 border-r-2 shadow-lg" class:open>
	<nav class="p-12 text-xl">
    <p>Now is the time</p>
    <ol>
      <li>can we do regular html?</li>
      <li>I hope so</li>
    </ol>
    {#each buttons as b}
      <p><button on:click={closeMe}>{b}</button></p>
	  {/each}
	</nav>
</aside>
{/if}

<style>
 aside {
	 left: -100%;
	 transition: left 0.3s ease-in-out;
   height: 500px; /* ?? I can set to px and is honored ... 100% goes back to 223px */
 }
 
 .open {
	 left: 0;
 }
</style>
