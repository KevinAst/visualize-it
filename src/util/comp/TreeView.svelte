<script context="module">
 // retain ModuleScoped expansion state for each tree node
 // ... so as to retain grandchildren state when grandparents are collapsed :-)
 const _expansionState = {
   // accumTreeId: expanded <boolean>
 };
</script>

<script>
 // component params
 export let tree;
 export let omitRoot    = false;
 export let depth       = 0;     // INTERNAL: maintain depth
 export let accumTreeId = '';    // INTERNAL: accumulative ID throughout tree

 // provide a visually animated transition for tree node expansion/contraction
 import {slide as myTrans} from 'svelte/transition';
 
 // decompose tree node
 // AI: parameterize tree structure interpretation (via callback param)
 //     ... allowing the operation on ANY structure :-)
 //     ... wait for SmartPkg production usage
 //         I suspect may need to be a proprietary component for this task (with all the DnD and double-click, etc.)
 const {label, children} = tree;

 // maintain the accumulative ID throughout our tree
 accumTreeId += (accumTreeId ? ' - ' : '') + label;

 // maintain expansion state
 let   expanded        = _expansionState[accumTreeId] || false; // ... default to false on first occurance
 $:    arrowDown       = expanded;
 const toggleExpansion = () => expanded = _expansionState[accumTreeId] = !expanded;

 // maintain indicator as to whether this is the top-level
 $: top = depth === 0;
</script>

{#if omitRoot && top && children}
  {#each children as child}
    <svelte:self tree={child} depth={depth + 1} accumTreeId={accumTreeId}/>
  {/each}
{:else}
  <ul class:top transition:myTrans="{{duration:500}}">
    <li>
      {#if children}
        <span on:click={toggleExpansion}>
  		    <span class="arrow" class:arrowDown>&#x25b6</span>
  		  	{label}
  		  </span>
        {#if expanded}
          {#each children as child}
            <svelte:self tree={child} depth={depth + 1} accumTreeId={accumTreeId}/>
          {/each}
        {/if}
      {:else}
        <span>
          <span class="no-arrow-spacer"/>
          {label}
        </span>
      {/if}
    </li>
  </ul>
{/if}

<style>
 ul {
   margin:          0;      /* nix default <ul> spacing: 1em, 0 */
   list-style-type: none;   /* nix traditional list bullets */
   padding-left:    1.2rem; /* lesser list indendation */
   user-select:     none;   /* disable selectable text */
 }
 ul.top { /* NO indentation FOR top-level node only */
   margin:  0;
   padding: 0;
 }
 .no-arrow-spacer {
   padding-left:    1.0rem;
 }
 .arrow {
/* color:               red; /* AI: how to access scss vars */
   cursor:              pointer;
	 display:             inline-block;
   transition-duration: 500ms;
	 transition-property: transform;
 }
 .arrowDown {
   transform: rotate(90deg);
 }
</style>
