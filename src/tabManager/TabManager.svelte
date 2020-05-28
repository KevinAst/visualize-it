<script context="module">
 import verify          from '../util/verify';
 import {isString}      from '../util/typeCheck';
 import {createLogger}  from '../util/logger';

 // our internal diagnostic logger (normally disabled, but keep enabled for a while)
 const log = createLogger('***DIAG*** <TabManager> ... ').enable();

 // DESC: The <TabManager> component manages the dynamics of all tabs
 //       in the visualize-it GUI.
 //       It is a "singleton" UI Component, instantiated one time within the
 //       appLayout feature.

 // NOTE: vars prefixed with underbar ("_"):
 //       - represent component instance state of the one-and-only <TabManager> instance
 //       - are initialized through life-cycle-hooks (e.g. onMount())
 //       - are indirectly used for public promotion to the outside world

 // functional component binding supporting our public promotion
 let _activateTab$comp;
 const isMounted = () => _activateTab$comp ? true : false; // ... use ANY of our component instance state
 const mounted   = (activateTab$comp) => {
   // verify singleton restriction
   verify(!isMounted(), 'only ONE <TabManager/> component should be instantated (it is a "singleton" UI Component)');

   // register our component bindings
   _activateTab$comp = activateTab$comp;
 };
 const unmounted = () => {
   // unregister our component bindings
   _activateTab$comp = null;
 };

 //***
 //*** PUBLIC API
 //***

 // + activateTab(tabId, preview=true): void ... activate tab preregistered to given tabId
 export function activateTab(tabId, preview=true) {
   // validate setup and parameters
   const check = verify.prefix('activateTab() issue: ');
   // ... setup
   check(isMounted(), 'a single <TabManager/> component MUST be instantated (it is a "singleton" UI Component)');
   // ... tabId
   check(tabId,            'tabId is required');
   check(isString(tabId),  'tabId must be a string');
   // ... preview
   check(preview===true || 
         preview===false,  'preview must be a boolean');

   // propogate request to our component instance
   _activateTab$comp(tabId, preview, check);
 }
</script>

<script>
 import {onMount}    from 'svelte';
 import Tab, {Label, Icon} from '@smui/tab';
 import TabBar       from '@smui/tab-bar';
 import TabPanel     from './TabPanel.svelte';
 import tabRegistry  from './tabRegistry';

 // maintain our external bindings (when <TabManager> is mounted)
 onMount(() => mounted(activateTab$comp), unmounted);

 // our component state
 let tabs          = [];   // ... all tabs being managed:      TabController[]
 let activeTab     = null; // ... the active tab (visualized): TabController (null for NO tabs)
 let lastActiveTab = null; // ... assist in pruning duplicate activeTab events

 // monitor/promote activeTab changes
 $: {
   if (activeTab && activeTab !== lastActiveTab) {
     log(`activeTab changed: ${activeTab.getTabId()}`);
     lastActiveTab = activeTab;
   }
 }

 // locate the tab being managed ... return: TabController or undefined
 const findTab = (tabId) => tabs.find( (tabController) => tabController.getTabId()===tabId );

 function activateTab$comp(tabId, preview, check) {
   // reset our activeTab (when requested tab is already managed by <TabManager>)
   activeTab = findTab(tabId);

   // setup new tab (when the requested tab is NOT under <TabManager> control)
   if (!activeTab) {
     // must be in the tabRegistry
     activeTab = tabRegistry.getTabController(tabId);
     check(activeTab, `tabId: '${tabId}' cannot be displayed ... it has NOT been pre-registered via: registerTab(tabController)`);

     // introduce the new tab
     tabs = [...tabs, activeTab];
     log(`activateTab('${tabId}') ... introduced NEW: `, activeTab)
   }
   else {
     log(`activateTab('${tabId}') ... used EXISTING: `, activeTab)
   }
 }

 // WORK-AROUND supporting dynamic tabs in @smui
 // - without this, we receive a @smui internal error (whenever the tabs array changes):
 //   Tab.svelte:58 Uncaught (in promise) TypeError: Cannot read property 'tabIndicator_' of undefined
 // - see issue: https://github.com/hperrin/svelte-material-ui/issues/67
 $: resolveTabs = Promise.resolve(tabs);
</script>


{#if tabs.length}
  {#await resolveTabs then tabs}
    <!-- render the tabs -->
    <div> <!-- ?? do NOT believe this <div> is needed -->
      <TabBar tabs={tabs} let:tab key={(tab) => tab.getTabId()} bind:active={activeTab}>
        <Tab {tab} minWidth>
          <Label>{tab.getTabName()}</Label>
          <Icon on:click={()=> alert('?? closing tab')} class="material-icons">cancel</Icon> <!-- ?? cannot get on:click to work ... even with Button wrapper -->
        </Tab>
      </TabBar>
    </div>
    
    <!-- render the tab content -->
    <!-- ?? adding key (tab.getTabId()) does NOT help in conditional rendering ... when tabs array changes, all panels unmounted/remounted :-( -->
    {#each tabs as tab (tab.getTabId())}
      <TabPanel {tab} active={tab===activeTab}/>
    {/each}

  {/await}
{:else}
  <span>Spash Page</span>
{/if}
