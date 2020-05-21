<script context="module">
 // retain ModuleScoped expansion state for each tree node
 // ... so collapsing a parent doesn't loose expansion state of children :-)
 const _expansionState = {
   // accumTreeId: expanded <boolean>
 };

 // ANIMATION-HACK: slight animation improvement hack - only transition the top-level (being expanded)
 let _toggleNodeId = null; // ANIMATION-HACK
</script>

<script>
 // component params
 export let tree;
 export let omitRoot    = false;
 export let accumTreeId = '';    // INTERNAL: accumulative ID throughout tree

 // provide a visually animated transition for tree node expansion/contraction
 import {slide} from 'svelte/transition';

 import Ripple from '@smui/ripple';
 
 // decompose tree node
 // AI: parameterize tree structure interpretation (via callback param)
 //     ... allowing the operation on ANY structure :-)
 //     ... wait for SmartPkg production usage
 //         I suspect may need to be a proprietary component for this task (with all the DnD and double-click, etc.)
 const {label, children} = tree;

 // maintain indicator as to whether this is the top-level
 const top = accumTreeId === '';

 const parentTreeId = accumTreeId; // ANIMATION-HACK

 // maintain the accumulative ID throughout our tree
 accumTreeId += (top ? '' : ' - ') + label;

 // maintain expansion state
 // ... initialize from any prior expansion state
 // ... default to NOT expanded (false) on first occurance
 let   expanded        = _expansionState[accumTreeId] || false;
 $:    arrowDown       = expanded;
 const toggleExpansion = () => {
   expanded      = _expansionState[accumTreeId] = !expanded;
   _toggleNodeId = accumTreeId; // ANIMATION-HACK
 }

 // only transition the top-most node whose expansion changed
 let duration = _toggleNodeId===parentTreeId ? 500 : 0; // ANIMATION-HACK

</script>

{#if omitRoot && top && children}
  {#each children as child}
    <svelte:self tree={child} accumTreeId={accumTreeId}/>
  {/each}
{:else}
  <ul class:top transition:slide="{{duration}}">
    <li>
      {#if children}
        <span class="mdc-typography--subtitle2 expander"
              on:click={toggleExpansion}
              use:Ripple={{ripple: true, color: 'surface', unbounded: false}}>
          <span class="arrow" class:arrowDown>&#x25b6</span>
          {label}
        </span>
        {#if expanded}
          {#each children as child}
            <svelte:self tree={child} accumTreeId={accumTreeId}/>
          {/each}
        {/if}
      {:else}
        <span class="mdc-typography--subtitle2">
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
 .expander {
   cursor:  pointer;
 }
 .arrow {
/* color:               red; /* AI: how to access scss vars */
   display:             inline-block;
   transition-duration: 500ms;
   transition-property: transform;
 }
 .arrowDown {
   transform: rotate(90deg);
 }
</style>
