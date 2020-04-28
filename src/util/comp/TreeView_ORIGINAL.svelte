<script>
 export let tree;
 export let depth = 0;
 export let onClick = null; // click handler
 
 const {label, children} = tree;

 let {expanded = false} = tree;

 function clickHandler() {
	 expanded = !expanded;
	 if(!children && !!onClick) {
		 onClick(tree, depth, expanded);
	 }
 }
</script>

<style>
 p.expanded {
	 color: blue;
 }
 p.collapsed {
	 color: red;
 }
</style>

{#if !!label}
<p on:click={clickHandler} class:expanded class:collapsed={!expanded}>{label} ({depth})</p>
{/if}

{#if !!children && expanded}
<ul>
	{#each children as child}
	<li>
		<svelte:self tree={child} depth={++depth} {onClick}/>
	</li>
  {/each}
</ul>
{/if}
