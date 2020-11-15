<script context="module">
 // retain ModuleScoped expansion state for each tree node
 // ... so collapsing a parent doesn't loose expansion state of children :-)
 const _expansionState = {
   // accumTreeId: expanded <boolean>
 };
</script>

<script>
 import {getRegisteredTab,
         activateTab}        from '../pkgEntryTabs';
 import {isPkg}              from '../util/typeCheck';
 import genDualClickHandler  from '../util/ui/genDualClickHandler';
 import Icon                 from '../util/ui/Icon.svelte';
 import {slide}              from 'svelte/transition'; // visually animated transitions for tree node expansion/contraction


 // component params ?? greatly simplify (with new PkgTree support) by passing in ONLY pkgTree (gleaning other things from this)
 export let pkg;                 // the SmartPkg entry point (for public consumption) ... for internal recursive usage this is a PkgTree
 export let inEditMode;          // true: edit package structure, false: package is read-only
 export let accumTreeId = '';    // INTERNAL: accumulative ID throughout tree ?? glean from PkgTree itself

 // our edit/view styling
 $: style = inEditMode ? 'color: blue;' : '';

 // maintain our primary control indicators
 let top = true; // is this the top-level
 let pkgTree;    // our PkgTree (entries)
 if (isPkg(pkg)) { // ... top-level entry point (a SmartPkg)
   pkgTree     = pkg.rootDir;
   top         = true;
   accumTreeId = pkg.getPkgId();    // force our top accumTreeId to be our pkg id ?? glean from PkgTree itself
   // console.log(`??$$ TEMP TEST: ViewPkgTree.svelte ROOT - NEW PkgTree.getPkgTreeId() ${accumTreeId === pkgTree.getPkgTreeId() ? 'GREAT: SAME' : 'BAD: DIFFERENT'}`);
   // console.log(`xx <ViewPkgTree> for ${pkg.getPkgName()}:\n`, {pkgTree});
 }
 else { // ... subordinate levels within internal recursive usage (PkgTree entries)
   pkgTree      = pkg;
   top          = false;
   accumTreeId += ` - ${pkgTree.getName()}`; // ?? glean from PkgTree itself
   // console.log(`??$$ TEMP TEST ViewPkgTree.svelte INTR - NEW PkgTree.getPkgTreeId() ${accumTreeId === pkgTree.getPkgTreeId() ? 'GREAT: SAME' : 'BAD: DIFFERENT'}`);
 }
 
 // maintain our reflexive in-sync label qualifier
 // ... for PkgEntries, we utilize it's changeManager reflexive store
 const pkgEntry      = pkgTree.isEntry() ? pkgTree.getEntry()                  : null;
 const changeManager = pkgEntry          ? pkgEntry.changeManager              : null;
 let inSyncIcon;
 let pkgEntryToolTip;
 $: if (changeManager && !$changeManager.inSync) {
   inSyncIcon       = $changeManager.inSyncIcon();
   pkgEntryToolTip += ' (modified - Package needs to be saved)';
 }
 else {
   inSyncIcon      = 'NONE';
   pkgEntryToolTip = pkgEntry ? `${pkgEntry.diagClassName()}: ${pkgEntry.getEPkgId()}` : '';
 }

 // decompose self's tree node
 $:    label    = pkgTree.getName();
 const children = pkgTree.getChildren();

 // maintain expansion state
 // ... initialize from any prior expansion state
 // ... default to NOT expanded (false) on first occurance
 let   expanded        = _expansionState[accumTreeId] || false;
 $:    arrowDown       = expanded;
 const toggleExpansion = () => {
   expanded = _expansionState[accumTreeId] = !expanded;
 };

 // locate the tabController pre-registered to this pkgEntry
 // ... preregisterTab() occurs in PkgViewer.svelte
 // ... NOTE: pkgEntry.getPkgEntryId() is the the tabId of a TabControllerPkgEntry object
 const tabController = pkgEntry ? getRegisteredTab(pkgEntry.getPkgEntryId()) : null;

 const displayEntry = genDualClickHandler(
   () => activateTab(tabController.getTabId(), /*preview*/true),  // single-click
   () => activateTab(tabController.getTabId(), /*preview*/false), // double-click
 );

 // support drag (of DnD), based on polymorphic SmartObj.copyable() -and- PkgTree.copyable()
 const copySrcPkgEntry = pkgEntry   ? pkgEntry.copyable() : null;
 $:    copySrcPkgTree  = inEditMode ? pkgTree.copyable()  : null;  // ?? move "inEditMode" conditional logic into pkgTree.copyable() ONCE we can get to the pkg
 $:    draggable       = copySrcPkgEntry || copySrcPkgTree  ? true : false;
 function handleDragStart(e) { // ... conditionally invoked when `draggable` is true (via draggleble DOM attribute - below)
   // console.log(`xx ViewPkgTree handleDragStart(): starting`);

   // specify cursor effects that ARE allowed
   // ... subsequently later in dragenter/dragover events (via the dropEffect prop)
   // ... multiple effects used ('linkMove'):
   //     - link: for PkgEntry (to link a copy into Comp/Scene/Collage)
   //     - move: for PkgTree  (to move SmartPkg PkgTree directory structure)
	 e.dataTransfer.effectAllowed = 'linkMove';

   // pack the data for our drag operation
   // NOTE: We can use our own meta type (however NOTE that is is forced to be lower-case)
   // ... PkgEntry (to link a copy into Comp/Scene/Collage))
   if (copySrcPkgEntry) {
     e.dataTransfer.setData(copySrcPkgEntry.type, copySrcPkgEntry.key);
   }
   // ... PkgTree (to move SmartPkg PkgTree directory structure)
   if (copySrcPkgTree) {
     e.dataTransfer.setData(copySrcPkgTree.type, copySrcPkgTree.key);
   }
   // ?? FOR ABOVE: HAVE FOLLOWING: ?? TRASH THIS COMMENT ONCE FULLY RETROFITTED
   //    - pkgTree      PkgTree (is root '/' WHEN top===true)
   //    - top          true, pkgTree is '/'
   //    - accumTreeId  Ex: 'com.astx.KONVA2 - scenes - More Depth - Scene2' ?? suspect we need to maintain this within PkgTree
 };

 // allow DnD drops based on polymorphic PkgTree.pastable()
 // ... GRRR: Must implement BOTH dragenter/dragover BECAUSE have to override the default implementation (which prevents a drop).
 //           This is optimized by caching, since nothing changes (for us) in drag over.
 // ??$$ NEW
 let isAllowed = null;
 function allowDrops_enter(e) {
   isAllowed = pkgTree.pastable(e);
   // console.log(`xx allowDrops_enter on: `, {isAllowed, pkgTree, types: e.dataTransfer.types});
   allowDrops_over(e);
 };
 function allowDrops_over(e) {
   // console.log(`xx allowDrops_over`);
   if (isAllowed) {
     e.preventDefault(); // allow drop (nullify default disallow behavior)
     // console.log(`xx dropEffect BEFORE: ${e.dataTransfer.dropEffect}`);
     e.dataTransfer.dropEffect = 'move'; // change cursor to reflect droppable
     // console.log(`xx dropEffect AFTER: ${e.dataTransfer.dropEffect}`);
   }
 }

 // perform DnD drop based on polymorphic PkgTree.paste()
 // ??$$ NEW
 function handleDrop(e) {
   // console.log(`xx handleDrop on: `, {pkgTree});
   pkgTree.paste(e);
 };

 // console.log(`xx <ViewPkgTree> for ${accumTreeId}`);
</script>

<!-- omit the top root directory node - a "/" (it is implied by our Package Header) -->
{#if top && children}
  {#each children as child}
    <svelte:self pkg={child} {inEditMode} {accumTreeId}/>
  {/each}
{:else}
  <ul class:top transition:slide="{{duration: 500}}">
    <li>
      {#if children}
        <span class="mdc-typography--subtitle2 expander"
              title="Directory (click to expand/contract)"
              {draggable}
              {style}
              on:dragstart={handleDragStart}
              on:dragenter={allowDrops_enter}
              on:dragover={allowDrops_over}
              on:drop|preventDefault={handleDrop}

              on:click={toggleExpansion}>
          <span class="arrow" class:arrowDown>&#x25b6</span>
          {label}
        </span>
        {#if expanded}
          {#each children as child}
            <svelte:self pkg={child} {inEditMode} {accumTreeId}/>
          {/each}
        {/if}
      {:else}
        <span class="mdc-typography--subtitle2 pkg-entry"
              title={pkgEntryToolTip}
              on:click={displayEntry}>
          <span class="no-arrow-spacer"/>

          <span {draggable}
                {style}
                on:dragstart={handleDragStart}
                on:dragenter={allowDrops_enter}
                on:dragover={allowDrops_over}
                on:drop|preventDefault={handleDrop}>

            <Icon name="{pkgEntry.getIconName()}"
                  size="1.0rem"/>

            {label}

          </span>

          <Icon name={inSyncIcon}
                {style}
                size="1.0rem"/>

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
 .pkg-entry{
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
