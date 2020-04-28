<script>
 export let tree;
 export let depth = 0;
 
 const {label, children} = tree; // ?? parameterize tree structure interpretation (via callback param), allowing this to operate on ANY structure

 let expanded = false;
 $: collapsed = !expanded;

 function toggleExpansion() {
   expanded = !expanded;
 }

</script>

<style>

 ul {
   padding-left:    1.5em; /* lesser list indendation */
   list-style-type: none;  /* nix traditional list bullets */
   user-select:     none;  /* disable selectable text */
 }

 /* ?? no like ... DISABLE for now ... if we use this, must style in parent */
 ul.topDISABLE { /* NO indentation FOR top-level node only */
   margin:  0;
   padding: 0;
 }

 .caret {
   cursor: pointer;
 }

 .caret::before { /* caret: RIGHT  */
   content:      "\25B6"; /* right-pointing triangle (unicode) */
   color:        red;
   display:      inline-block;
   margin-right: 6px;
 }

 .caret-down::before { /* caret: DOWN  */
   transform: rotate(90deg);  /* simply rotate the entire content (of caret) */
 }

 .expanded {
   display: block;
 }
 .collapsed {
   display: none;
 }

</style>

<!-- ?? Cannot have an unclosed HTML element inside an #if block
     ... Svelte is analyzing the DOM
     ... CURRENTLY I am duplicating the inner code
     ... TODO: what is the Svlete way to eliminate this?
{#if depth===0}
  <ul class="top">
{/if}
-->


{#if depth===0}
  <ul class="top">

    <!-- TODO: DUPLICATE DOM SNIPPIT :-(  -->
    {#if children}
      <li>
        <span on:click|stopPropagation={toggleExpansion} class="caret {expanded ? 'caret-down' : ''}">{label}</span>
        <ul class:expanded class:collapsed>
          {#each children as child}
            <svelte:self tree={child} depth={depth+1}/>
          {/each}
        </ul>
      </li>
    {:else}
      <li>
        {label}
      </li>
    {/if}

  </ul>

{:else}

    <!-- TODO: DUPLICATE DOM SNIPPIT :-(  -->
    {#if children}
      <li>
        <span on:click|stopPropagation={toggleExpansion} class="caret {expanded ? 'caret-down' : ''}">{label}</span>
        <ul class:expanded class:collapsed>
          {#each children as child}
            <svelte:self tree={child} depth={depth+1}/>
          {/each}
        </ul>
      </li>
    {:else}
      <li>
        {label}
      </li>
    {/if}

{/if}



<!-- ??
{#if depth===0}
  </ul>
{/if}
-->
