<script>
 import TabEntry    from './TabEntry.svelte';
 import TabPanel    from './TabPanel.svelte';
 import verify      from '../../verify';
 import {isClass}   from '../../typeCheck';

 // accept component props
 export let tabManager; // ... the TabManager governing our set of dynamic tabs
 export let splashComp; // ... the UI Component to use when NO tabs are present

 // validate component props
 const check = verify.prefix('<Tabs> property violation: ');
 // ... tabManager
 check(tabManager,                'tabManager is required');
 check(tabManager.preregisterTab, 'tabManager must be a TabManager instance');
 // ... splashComp
 check(splashComp,                'splashComp is required');
 check(isClass(splashComp),       'splashComp must be a Svelte UI Component');

 // pull out our tabs store (a reactive svlete store representing ALL visualized tabs)
 const {tabs, activeTab} = tabManager;
</script>


{#if $tabs.length > 0}
  <!-- TabBar with TabEntries -->
  <div class="tab-bar">
    {#each $tabs as tab (tab.getTabId())}
      <TabEntry {tab} {tabManager}/>
  	{/each}
  </div>
  
  <!-- TabPanels  -->
  {#each $tabs as tab (tab.getTabId())}
    <TabPanel {tab} isActive={tab===$activeTab}/>
  {/each}
{:else}
  <svelte:component this={splashComp}/>
{/if}


<style>
 .tab-bar {
	 border-bottom: solid lightgray 1px;
	 display:       flex;
	 flex-wrap:     wrap; /* wrap tabs to 2nd line (simple technique when too many tabs to fit) */
 }
</style>
