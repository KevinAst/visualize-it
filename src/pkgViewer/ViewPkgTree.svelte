<script context="module">
 // retain ModuleScoped expansion state for each tree node
 // ... so collapsing a parent doesn't loose expansion state of children :-)
 const _expansionState = {
   // accumTreeId: expanded <boolean>
 };
</script>

<script>
 import {TabControllerPkgEntry, 
         preregisterTab,
         activateTab}        from '../pkgEntryTabs';
 import {isPkg}              from '../util/typeCheck';
 import genDualClickHandler  from '../util/ui/genDualClickHandler';
 import {slide}              from 'svelte/transition'; // visually animated transitions for tree node expansion/contraction
 import Ripple               from '@smui/ripple';


 // component params
 export let pkg;                 // the SmartPkg entry point (for public consumption) ... for internal recursive usage this is a PkgTree
 export let accumTreeId = '';    // INTERNAL: accumulative ID throughout tree

 // maintain our primary control indicators
 let top = true; // is this the top-level
 let pkgTree;    // our PkgTree (entries)
 if (isPkg(pkg)) { // ... top-level entry point (a SmartPkg)
   pkgTree     = pkg.rootDir;
   top         = true;
   accumTreeId = pkg.getPkgId();    // force our top accumTreeId to be our pkg id
   // console.log(`xx <ViewPkgTree> for ${pkg.getPkgName()}:\n`, {pkgTree});
 }
 else { // ... subordinate levels within internal recursive usage (PkgTree entries)
   pkgTree      = pkg;
   top          = false;
   accumTreeId += ` - ${pkgTree.getName()}`;
 }
 
 // maintain our reflexive in-sync label qualifier
 // ... for PkgEntries, we utilize it's changeManager reflexive store
 const changeManager = pkgTree.isEntry() ? pkgTree.getEntry().changeManager : null;
 $: inSyncLabelQual = changeManager ? $changeManager.inSyncLabelQualifier : '';

 // decompose self's tree node
 $:    label    = pkgTree.getName() + inSyncLabelQual;
 const children = pkgTree.getChildren();

 // maintain expansion state
 // ... initialize from any prior expansion state
 // ... default to NOT expanded (false) on first occurance
 let   expanded        = _expansionState[accumTreeId] || false;
 $:    arrowDown       = expanded;
 const toggleExpansion = () => {
   expanded = _expansionState[accumTreeId] = !expanded;
 };

 // pre-register our pkgEntries for tabs display
 let tabController = null;
 if (pkgTree.isEntry()) {
   tabController = new TabControllerPkgEntry(pkgTree.getEntry());
   preregisterTab(tabController);
 }
 const displayEntry = genDualClickHandler(
   () => activateTab(tabController.getTabId(), /*preview*/true),  // single-click
   () => activateTab(tabController.getTabId(), /*preview*/false), // double-click
 );

 // console.log(`xx <ViewPkgTree> for ${accumTreeId}`);
</script>

<!-- omit the top root directory node - a "/" (it is implied by our Package Header) -->
{#if top && children}
  {#each children as child}
    <svelte:self pkg={child} {accumTreeId}/>
  {/each}
{:else}
  <ul class:top transition:slide="{{duration: 500}}">
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
            <svelte:self pkg={child} {accumTreeId}/>
          {/each}
        {/if}
      {:else}
        <span on:click={displayEntry}
              class="mdc-typography--subtitle2">
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
