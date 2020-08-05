<script>
 import Icon from '../Icon.svelte';

 // accept component props
 export let tab;        // ... the TabController we are displaying
 export let tabManager; // ... the TabManager governing our set of dynamic tabs

 // validate component props
 // ... because this is an internal component, we bypass this step :-)

 // extract the various controls needed from our tabManager
 const {activeTab, previewTab, activateTab, closeTab} = tabManager;

 // extract needed primitives out of our tab
 // ... this optimizes svelte, because it uses primitive staleness identity semantics
 const tabId   = tab.getTabId();
 const tabName = tab.getTabName();

 // maintain our dynamic css classes
 $: classes = `tab-entry
               ${tab===$activeTab  ? 'active-tab'  : ''}
               ${tab===$previewTab ? 'preview-tab' : ''}`;
</script>


<!-- in lieu of genDualClickHandler(), 
     double registration of click/dblclick WORKS (in this case),
     and is more responsive! -->
<!-- ?? add contextmenu ... see: c:/dev/visualize-it/src/tabManager/TabEntry.svelte -->
<div class={classes}
     on:click=   {() => activateTab(tabId, /*preview*/true)}
     on:dblclick={() => activateTab(tabId, /*preview*/false)}>
  {tabName}
  <!-- ?? play with only promoting close on active tab ?? or on hover ?? could place spacer in to reduce jumpyness -->
  <Icon name="cancel_presentation"
        size="0.9em"
        on:click={(e)=> { e.stopPropagation(); closeTab(tabId); }}/>
</div>


<style>
 .tab-entry {
   cursor:      pointer;
   user-select: none;
   font-weight: 500;
	 padding:     0.2rem 0.5rem;
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
