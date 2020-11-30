<script context="module">
 // retain ModuleScoped expansion state for each tree node
 // ... so collapsing a parent doesn't loose expansion state of children :-)
 const _expansionState = {
   // pkgTreeKey: expanded <boolean>
 };
</script>

<script>
 import {getRegisteredTab,
         activateTab}        from '../pkgEntryTabs';
 import {isPkg}              from '../util/typeCheck';
 import genDualClickHandler  from '../util/ui/genDualClickHandler';
 import Icon                 from '../util/ui/Icon.svelte';
 import DispMode             from '../core/DispMode';
 import {slide}              from 'svelte/transition'; // visually animated transitions for tree node expansion/contraction
 import {findAncestorWithCssClass} from '../util/ui/domUtil';

 // component props
 export let pkgTree;  // the PkgTree to display (will recurse into any sub-structure)

 // our primary reflexive state
 $: pkg        = pkgTree.getPkg();
 $: inEditMode = pkg.getDispMode() === DispMode.edit; // true: edit package structure, false: package is read-only
 $: pkgTreeKey = pkgTree.getKey();
 $: style      = inEditMode ? 'color: blue;' : '';    // edit/view styling
 $: top        = pkgTree.isRoot();
 
 // maintain our reflexive in-sync label qualifier
 // ... for PkgEntries, we utilize it's changeManager reflexive store
 const pkgEntry      = pkgTree.isEntry() ? pkgTree.getEntry()     : null;
 const changeManager = pkgEntry          ? pkgEntry.changeManager : null;
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
 $: label    = pkgTree.getName();
 $: children = pkgTree.getChildren();

 // maintain expansion state
 // ... initialize from any prior expansion state
 // ... default to NOT expanded (false) on first occurance
 $: expanded  = _expansionState[pkgTreeKey] || false;
 $: arrowDown = expanded;
 const toggleExpansion = () => {
   expanded = _expansionState[pkgTreeKey] = !expanded;
 };

 // locate the tabController pre-registered to this pkgEntry
 // ... preregisterTab() occurs in PkgViewer.svelte
 // ... NOTE: pkgEntry.getPkgEntryId() is the the tabId of a TabControllerPkgEntry object
 const tabController = pkgEntry ? getRegisteredTab(pkgEntry.getPkgEntryId()) : null;

 const displayEntry = genDualClickHandler(
   () => activateTab(tabController.getTabId(), /*preview*/true),  // single-click
   () => activateTab(tabController.getTabId(), /*preview*/false), // double-click
 );

 // support drag (of DnD), based on a combination of two polymorphic APIs: SmartObj.copyable() -and- PkgTree.copyable()
 const copySrcPkgEntry = pkgEntry ? pkgEntry.copyable() : null;
 $:    copySrcPkgTree  = pkgTree.copyable();
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
 };

 // allow DnD drops based on polymorphic PkgTree.pastable()
 // ... GRRR: Must implement BOTH dragenter/dragover BECAUSE have to override the default implementation (which prevents a drop).
 //           This is optimized by caching, since nothing changes (for us) in drag over.
 let isAllowed = null;
 let dropZone   = null; // null, 'before', 'in', 'after'
 $: dropZoneCssClass = dropZone ? `dropZone-${dropZone}` : '';
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

     // maintain our visual drop zone (before/in/after)
     dropZone = getDropZone(e);
   }
 }

 // determine drop zone of the supplied DnD event (before/in/after)
 function getDropZone(e) {

   // for sizing heuristics, we MUST use the DOM element that is managing our DnD event
   // ... NOT: one of it's subordinates!
   //          This insures the overall sizing is correct and NOT sporadic!!
   const dropTargetElm = findAncestorWithCssClass(e.target, 'dropTarget');
   // if (dropTargetElm !== e.target) {
   //   console.log(`XX <ViewPkgTree> getDropZone(): using different target: `, {dropTargetElm, event_target: e.target});
   // }

   const boundingRect  = dropTargetElm.getBoundingClientRect();
   let   {top, bottom} = boundingRect;       // ... tiny range (in our UI context): 17 pixels to work with
   const clientY       = e.clientY;          // ... this WILL be in the top/bottom range
   const numSections   = children ? 3 : 2;   // ... 3 sections for directories, 2 sections for entries
   const boundry       = (bottom - top) / numSections; // ... divide up our sections evenly (in our case, rouphly 5 pixels for directories)

   // prevent oscillation by stripping out the varying borders
   // ... this is a brute force technique (a bit ugly)
   //     I tried using CSS (box-sizing: border-box), 
   //     but this ONLY impacts boundingRect height, NOT top/bottom
   const styling      = getComputedStyle(e.target);
   const topBorder    = styling.getPropertyValue('border-top-width');
   const bottomBorder = styling.getPropertyValue('border-bottom-width');
   top    += parseInt(topBorder); // ... convert "4px" to 4
   bottom -= parseInt(bottomBorder);

   // define our dropZone
   const rtnDropZone   = clientY > bottom-boundry ? 'after' : (clientY < top+boundry ? 'before' : 'in')

   // console.log(`XX getDropZone():`, {rtnDropZone, clientY, top, bottom, boundry, topBorder, bottomBorder});
   // console.log(`XX getDropZone(): ${rtnDropZone}`);
   return rtnDropZone;
 }

 // perform DnD drop based on polymorphic PkgTree.paste()
 function handleDrop(e) {
   // console.log(`\n\nxx handleDrop invoking paste() on: `, {pkgTree});
   pkgTree.paste(e, dropZone);
   dropZone = null; // clear visual dropZone
 };

 // console.log(`xx <ViewPkgTree> for ${pkgTreeKey}`);
</script>

<!-- omit the top root directory node - a "/" (it is implied by our Package Header) -->
{#if top && children}
  {#each children as child (child.getKey())}
    <svelte:self pkgTree={child}/>
  {/each}
{:else}
  <ul class:top transition:slide="{{duration: 500}}">
    <li>
      {#if children}
        <span class="mdc-typography--subtitle2 expander dropTarget {dropZoneCssClass}"
              title="Directory (click to expand/contract)"
              {draggable}
              {style}
              on:dragstart={handleDragStart}
              on:dragenter={allowDrops_enter}
              on:dragover={allowDrops_over}
              on:dragleave={()=>dropZone=null}
              on:drop|preventDefault={handleDrop}
              on:click={toggleExpansion}>
          <span class="arrow" class:arrowDown>&#x25b6</span>
          {label}
        </span>
        {#if expanded}
          {#each children as child (child.getKey())}
            <svelte:self pkgTree={child}/>
          {/each}
        {/if}
      {:else}
        <span class="mdc-typography--subtitle2 pkg-entry"
              title={pkgEntryToolTip}
              on:click={displayEntry}>
          <span class="dropTarget {dropZoneCssClass}"
                {draggable}
                {style}
                on:dragstart={handleDragStart}
                on:dragenter={allowDrops_enter}
                on:dragover={allowDrops_over}
                on:dragleave={()=>dropZone=null}
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
 .dropZone-before {
   border-top: 4px solid;
 }
 .dropZone-in {
   border: 2px dotted;
 }
 .dropZone-after {
   border-bottom: 4px solid;
 }
</style>
