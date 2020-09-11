<script context="module">
 const CLOSE = 'cancel_presentation';
 const STALE = 'fiber_manual_record';
</script>

<script>
 import Icon from '../Icon.svelte';
 import Menu                          from '@smui/menu';
 import List, {Item, Text, Separator} from '@smui/list';

 // accept component props
 export let tab;        // ... the TabController we are displaying
 export let tabManager; // ... the TabManager governing our set of dynamic tabs

 // validate component props
 // ... because this is an internal component, we bypass this step :-)

 // extract the various controls needed from our tabManager
 const {activeTab, previewTab, activateTab, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs} = tabManager;

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

</script>


<!-- in lieu of genDualClickHandler(), 
     double registration of click/dblclick WORKS (in this case),
     and is more responsive! -->
<div class={classes}
     on:mouseover= {() => tabHover=true}
     on:mouseout=  {() => tabHover=false}
     on:click=     {() => activateTab(tabId, /*preview*/true)}
     on:dblclick=  {() => activateTab(tabId, /*preview*/false)}
     on:contextmenu|preventDefault={() => contextMenu.setOpen(true)}>

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
</style>
