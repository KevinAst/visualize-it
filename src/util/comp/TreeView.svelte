<script>
 // component params
 export let tree;
 export let depth = 0;

 $: top = depth === 0;

 // decompose tree node
 // TODO: parameterize tree structure interpretation (via callback param)
 //       ... allowing the operation on ANY structure :-)
 //       ... wait for SmartPkg production usage
 //           I suspect may need to be a proprietary component for this task (with all the DnD and double-click, etc.)
 const {label, children} = tree;

 // maintain expansion state
 let   expanded        = false;
 $:    collapsed       = !expanded;
 $:    arrowDown       = expanded;
 const toggleExpansion = () => expanded = !expanded;
</script>

<ul class:top>
  <li>
    {#if children}
      <span on:click={toggleExpansion}>
		    <span class="arrow" class:arrowDown>&#x25b6</span>
		  	{label}
		  </span>
      <div class:expanded class:collapsed>
        {#each children as child}
          <svelte:self tree={child} depth={depth + 1} />
        {/each}
      </div>
    {:else}
      {label}
    {/if}
  </li>
</ul>

<style>
 ul {
   list-style-type: none;   /* nix traditional list bullets */
   padding-left:    1.2rem; /* lesser list indendation */
   user-select:     none;   /* disable selectable text */
 }
 ul.top { /* NO indentation FOR top-level node only */
   margin:  0;
   padding: 0;
 }
 .arrow {
/* color:               red; */
   cursor:              pointer;
	 display:             inline-block;
	 transition-duration: 0.5s;
	 transition-property: transform;
 }
 .arrowDown {
   transform: rotate(90deg);
 }
 .expanded {
   display: block;
 }
 .collapsed {
   display: none;
 }
</style>
