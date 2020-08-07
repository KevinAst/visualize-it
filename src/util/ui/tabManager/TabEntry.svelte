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

 let contextMenu;

 // maintain our dynamic css classes
 $: classes = `tab-entry mdc-typography--subtitle2
               ${tab===$activeTab  ? 'active-tab'  : ''}
               ${tab===$previewTab ? 'preview-tab' : ''}`;
</script>


<!-- in lieu of genDualClickHandler(), 
     double registration of click/dblclick WORKS (in this case),
     and is more responsive! -->
<div class={classes}
     on:click=   {() => activateTab(tabId, /*preview*/true)}
     on:dblclick={() => activateTab(tabId, /*preview*/false)}
     on:contextmenu|preventDefault={() => contextMenu.setOpen(true)}>

  <!-- our tab label -->
  {tabName}

  <!-- close tab control -->
  <Icon name="cancel_presentation"
        size="1.0rem"
        title="Close Tab"
        on:click={(e)=> { e.stopPropagation(); closeTab(tabId); }}/>

</div>

<!-- context menu -->
<!-- NOTE: this menu MUST be outside of <div> (above) because KRAZY @smui on:SMUI:action is invoking on:click of that <div> invoking activateTab() -->
<span>
  <Menu bind:this={contextMenu}>
    <List class="mdc-typography--subtitle2">
      <Item on:SMUI:action={() => closeTab(tabId)}><Text>Close</Text></Item>
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
