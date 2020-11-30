<script context="module">
 const CLOSE = 'cancel_presentation';
 const STALE = 'fiber_manual_record';
</script>

<script>
 import Icon from '../Icon.svelte';
 import Menu                          from '@smui/menu';
 import List, {Item, Text, Separator} from '@smui/list';
 import {findAncestorWithCssClass}    from '../domUtil';

 // accept component props
 export let tab;        // ... the TabController we are displaying
 export let tabManager; // ... the TabManager governing our set of dynamic tabs

 // validate component props
 // ... because this is an internal component, we bypass this step :-)

 // extract the various controls needed from our tabManager
 const {activeTab, previewTab, activateTab, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs, repositionTab} = tabManager;

 // extract needed primitives out of our tab
 // ... this optimizes svelte, because it uses primitive staleness identity semantics
 const tabId   = tab.getTabId();
 const tabName = tab.getTabName();

 // the app-specific suplement to our popup context menu
 // ... if any (null for none)
 const AppContextMenu = tab.getAppContextMenu();

 // maintain our dynamic css classes
 $: classes = `tab-entry mdc-typography--subtitle2
               ${tab===$activeTab  ? 'active-tab'  : ''}
               ${tab===$previewTab ? 'preview-tab' : ''}`;

 // maintain our closeIcon -and- staleness reflexive state
 // NOTE: This is patterned after VSCode tabs, and cleans up the clutter by:
 //       - only displaying the closeIcon when it is active (or hovered over)
 //       - re-uses the closeIcon with a stale indicator (for modified tab resources)
 // NOTE: Regarding the TabContext usage:
 //       - for TabControllerPkgEntry derivations, the context will be a PkgEntry
 //         * in this case we utilize it's changeManager reflexive store
 //         * otherwize the changeManager will be undefined
 //       - AI: this is a slightly inappropriate coupling (app knowledge in this generic utility)
 const tabContext    = tab.getTabContext();
 const changeManager = tabContext.changeManager; // reflexive store ... undefined if tabContext is NOT PkgEntry (see NOTE above)

 let closeIconName;          // {string):  the icon name to use for our closeIcon control (reused for stale indicator)
 let closeIconVisible;       // {boolean}: is the closeIcon control visable? (generally NOT when tab is not-active)
 let closeIconStyle   = '';  // {string}:  the CSS styling used to make icon visable/hidden
 let closeIconToolTip = '';  // {string}:  the closeIcon tooltip (changes to reflect modified resources)
 let tabHover       = false; // {boolean}: is mouse hovered over the overall tab? (forces the tab to display the closeIcon control, even when non active)
 let closeIconHover = false; // {boolean}: is mouse hovered over the closeIcon control? (forces a stale indicator to morph back into the actual close icon)
 $: {
   // by default, our close icon is only visible on active tabs
   closeIconName    = CLOSE;
   closeIconVisible = tab===$activeTab;
   closeIconToolTip = 'Close Tab';
   
   // override: when resource is stale (i.e. needs saving) we morph our close icon to STALE
   //           and display it AT ALL TIMES
   if (changeManager && !$changeManager.inSync) {
     closeIconName    = STALE;
     closeIconVisible = true;
     closeIconToolTip = 'Close Modified Tab (resource is still held in package)';
   }

   // when mouse is hovered over our tab, show the closeIcon
   if (tabHover) {
     closeIconVisible = true;
   }

   // when mouse is hovered over the close icon, morph it into the "true close"
   if (closeIconHover) {
     closeIconName    = CLOSE;
     closeIconVisible = true;
   }

   // maintain our close visibility via CSS styling
   closeIconStyle = closeIconVisible ? '' : 'visibility: hidden;';
   // console.log(`xx TabEntry (${tabId}) reflexing ... closeIconName: '${closeIconName}' ... closeIconVisible: ${closeIconVisible} ... closeIconStyle: "${closeIconStyle}"`);
 }

 // our popup contextMenu binding
 let contextMenu;


 //***
 //*** DnD support of tabs order
 //***

 const dndPastableType = 'visualize-it/TabEntry'.toLowerCase();
 function handleDragStart(e) {
	 e.dataTransfer.effectAllowed = 'move';
   e.dataTransfer.setData(dndPastableType, tab.getTabId());
 };

 let isDropAllowed = false;
 let dropZone      = null; // null, 'before', 'after' // ?? AI: do this in LeftNav DnD too ... NO NEED to be reflixive ($:)
 $: dropZoneCssClass = dropZone ? `dropZone-${dropZone}` : '';

 function allowDrops_enter(e) { // of interest: this is actually executed more than you would think (on sub-elms of our tab-entry)
   // maintain closure state that is UNCHANGED for allowDrops_over
   isDropAllowed = e.dataTransfer.types.includes(dndPastableType);

   // defer to allowDrops_over
   allowDrops_over(e);
 };

 function allowDrops_over(e) {
   if (isDropAllowed) {
     e.preventDefault(); // allow drop (nullify default disallow behavior)
     // console.log(`xx dropEffect BEFORE: ${e.dataTransfer.dropEffect}`);
     e.dataTransfer.dropEffect = 'move'; // change cursor to reflect droppable
     // console.log(`xx dropEffect AFTER: ${e.dataTransfer.dropEffect}`);

     // maintain our visual drop zone (before/in/after)
     dropZone = getDropZone(e);
     // console.log(`xx allowDrops_over ... dropZone: ${dropZone}`);
   }
 }

 function getDropZone(e) { // determine drop zone of the supplied DnD event (before/after)

   // for sizing heuristics, we MUST use the DOM element that is managing our DnD event
   // ... NOT: one of it's subordinates!
   //          This insures the overall sizing is correct and NOT sporadic!!
   // ?? AI: do this in LeftNav DnD too
   const tabEntryElm = findAncestorWithCssClass(e.target, 'tab-entry');

   const boundingRect  = tabEntryElm.getBoundingClientRect();
   let   {left, right} = boundingRect;
   const clientX       = e.clientX;          // ... this WILL be in the left/right range
   const numSections   = 2;                  // ... 2 sections (before/after)
   const boundry       = (right - left) / numSections; // ... divide up our sections evenly

   // calculate/return our dropZone
   const rtnDropZone = clientX > right-boundry ? 'after' : 'before';
   // console.log(`XX getDropZone():`, {rtnDropZone, clientX, left, right, boundry/*, leftBorder, rightBorder*/});
   // console.log(`XX getDropZone(): ${rtnDropZone}`);
   return rtnDropZone;
 }

 // last drop event (used in detecting duplicate drop events)
 let lastDropEvent = null;

 function handleDrop(e) {
   const fromTabId = e.dataTransfer.getData(dndPastableType);
   const toTabId   = tab.getTabId();
   // console.log('XX handleDrop: ', {fromTabId, toTabId, dropZone});

   // NO-OP when duplicate drop events are detected
   // BUG: This is a work-aroung for now
   //      ... see similar situation (fully explained) in SmartPkg.js (search: lastPkgTreePasteEvent)
   if (lastDropEvent === e) {
     // console.log('XX <TabEntry> handleDrop(): NO-OP ... detected duplicate drop event :-(');
     return;
   }
   else {
     lastDropEvent = e;
   }

   // reposition the tabs
   repositionTab(fromTabId, toTabId, dropZone);

   // clear visual dropZone
   dropZone = null;
 };

</script>


<!-- in lieu of genDualClickHandler(), 
     double registration of click/dblclick WORKS (in this case),
     and is more responsive! -->
<div class="{classes} {dropZoneCssClass}"
     on:mouseover= {() => tabHover=true}
     on:mouseout=  {() => tabHover=false}
     on:click=     {() => activateTab(tabId, /*preview*/true)}
     on:dblclick=  {() => activateTab(tabId, /*preview*/false)}
     on:contextmenu|preventDefault={() => contextMenu.setOpen(true)}
     draggable={true}
     on:dragstart={handleDragStart}
     on:dragenter={allowDrops_enter}
     on:dragover={allowDrops_over}
     on:dragleave={()=>dropZone=null}
     on:drop|preventDefault={handleDrop}>

  <!-- classification icon -->
  <Icon name="{tabContext.getIconName()}"
        size="1.0rem"/>

  <!-- tab label -->
  {tabName}

  <!-- close tab control -->
  <span on:mouseover= {() => closeIconHover=true}
        on:mouseout=  {() => closeIconHover=false}>
    <Icon name={closeIconName}
          size="1.0rem"
          style={closeIconStyle}
          title={closeIconToolTip}
          on:click={(e)=> { e.stopPropagation(); closeTab(tabId); }}/>
  </span>

</div>

<!-- context menu -->
<!-- NOTE: this menu MUST be outside of <div> (above) because KRAZY @smui on:SMUI:action is invoking on:click of that <div> invoking activateTab() -->
<span>
  <Menu bind:this={contextMenu}>
    <List class="mdc-typography--subtitle2">

      <svelte:component this={AppContextMenu} tab={tab}/>

      <Item on:SMUI:action={() => closeTab(tabId)}><Text>Close Tab</Text></Item>
      <Item on:SMUI:action={() => closeOtherTabs(tabId)}><Text>Close Others</Text></Item>
      <Item on:SMUI:action={() => closeTabsToRight(tabId)}><Text>Close to the Right</Text></Item>
      <Item on:SMUI:action={() => closeAllTabs()}><Text>Close All</Text></Item>
      <Separator />
      <Item on:SMUI:action={() => alert('FUTURE: Reveal in Left Nav')}><Text>Reveal in Left Nav</Text></Item>
    </List>
  </Menu>
</span>


<style>
 .tab-entry {
   cursor:      pointer;
   user-select: none;
   font-weight: 500;
	 padding:     0.2rem 0.5rem;
   transition:  all, 0.3s;  /* transition animation for active-tab changes */
	 border:                  solid lightgray 1px;
	 border-bottom:           none;
	 border-top-left-radius:  10px;
	 border-top-right-radius: 10px;
 }

 .active-tab {
	 background-color: #26a69a; /* cheap hard-coded match of current system */
	 color:            #F5F5F5; /* whitesmoke */
 }

 .preview-tab {
	 font-style: italic;
 }

 .dropZone-before {
   border-left: 10px solid DarkRed;
 }
 .dropZone-after {
   border-right: 10px solid DarkRed;
 }

</style>
