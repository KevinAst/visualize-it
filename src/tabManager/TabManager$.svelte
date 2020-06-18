<script>
 import TabBar          from '@smui/tab-bar';
 import TabEntry        from './TabEntry.svelte';
 import TabPanel        from './TabPanel.svelte';
 import StartUpPage     from './StartUpPage.svelte';
 import tabRegistry     from './tabRegistry';
 import verify          from '../util/verify';
 import {isString,
         isBoolean}     from '../util/typeCheck';
 import {createLogger}  from '../util/logger';

 // our internal diagnostic logger (normally disabled, but keep enabled for a while)
 const log = createLogger('***DIAG*** <TabManager> ... ').enable();

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
 const findTab      = (tabId) => tabs.find(      (tabController) => tabController.getTabId()===tabId );
 const findTabIndex = (tabId) => tabs.findIndex( (tabController) => tabController.getTabId()===tabId );

 // WORK-AROUND supporting dynamic tabs in @smui
 // - without this, we receive a @smui internal error (whenever the tabs array changes):
 //   Tab.svelte:58 Uncaught (in promise) TypeError: Cannot read property 'tabIndicator_' of undefined
 // - see issue: https://github.com/hperrin/svelte-material-ui/issues/67
 $: resolveTabs = Promise.resolve(tabs);


 //***
 //*** Component API
 //***

 // + activateTab(tabId, preview=true): void ... activate tab preregistered to given tabId
 export function activateTab(tabId, preview=true) {

   // validate parameters
   const check = verify.prefix('activateTab() parameter violation: ');
   // ... tabId
   check(tabId,              'tabId is required');
   check(isString(tabId),    'tabId must be a string');
   // ... preview
   check(isBoolean(preview), 'preview must be a boolean');

   // reset our activeTab (when requested tab is already managed by <TabManager>)
   activeTab = findTab(tabId);

   // setup new tab (when the requested tab is NOT under <TabManager> control)
   if (!activeTab) {
     // must be in the tabRegistry
     activeTab = tabRegistry.getTabController(tabId);
     check(activeTab, `tabId: '${tabId}' cannot be displayed ... it has NOT been pre-registered via: tabRegistry.registerTab(tabController)`);

     // introduce the new tab
     tabs = [...tabs, activeTab];
     log(`activateTab('${tabId}') ... introduced NEW: `, activeTab)
   }
   else {
     log(`activateTab('${tabId}') ... used EXISTING: `, activeTab)
   }
 }

 // + closeTab(tabId): void ... close tab of given tabId
 export function closeTab(tabId) {

   // validate parameters
   const check = verify.prefix('closeTab() parameter violation: ');
   // ... tabId
   check(tabId,            'tabId is required');
   check(isString(tabId),  'tabId must be a string');

   // locate the tab to close
   const closeTabIndex = findTabIndex(tabId);
   if (closeTabIndex < 0) 
     return; // ... no-op if we can't find it
   const closeTab = tabs[closeTabIndex];

   // adjust activeTab (when it is being closed)
   if (closeTab === activeTab) {
     // shift the active tab to the right (except on end - to the left)
     // REMEMBER: we are dealing with the tabs array state BEFORE it has been altered
     //           ... we alter the tabs array in the next step (i.e. close our tab)

     //                                                 AT END ...        NOT AT END ...
     //                                                 ===============   ===============
     const nextIndx = (closeTabIndex===tabs.length-1) ? closeTabIndex-1 : closeTabIndex+1;
     activeTab = nextIndx < 0 ? undefined : tabs[nextIndx];
   }

   // close the requested tab
   tabs = tabs.filter( (tab) => tab !== closeTab );
 }
</script>


{#if tabs.length}
  {#await resolveTabs then tabs}
    <!-- tabs -->
    <div>
      <TabBar tabs={tabs} let:tab key={(tab) => tab.getTabId()} bind:active={activeTab}>
        <TabEntry {tab} isActive={tab===activeTab} closeTabFn={closeTab}/>
      </TabBar>
    </div>
    
    <!-- tab content -->
    <!-- TODO: ?? adding key (tab.getTabId()) does NOT help in conditional rendering ... when tabs array changes, all panels unmounted/remounted :-( -->
    {#each tabs as tab (tab.getTabId())}
      <TabPanel {tab} active={tab===activeTab}/>
    {/each}

  {/await}
{:else}
  <StartUpPage/>
{/if}


<style>
 * :global(.mdc-tab) {
   padding:        0 6px 0 12px;
   height:         30px;  /* WAS: 48px */
/* font-size:      .8rem; /* WAS: .875rem */
   font-weight:    bold;  /* WAS: 500 */
   text-transform: none;  /* WAS: uppercase */
 }

 * :global(.mdc-tab-indicator) :global(.mdc-tab-indicator__content--underline) {
   border-top-width: 4px; /* thicker active tab line (original 2px) */
 }

 * :global(.close-icon) {
   cursor:    pointer;
   font-size: 18px;     /* reduce icon size */
   color:     lightgrey;
 }

/*
 * :global(.mdc-tab__content) {
   align-items:     flex-end;  REM: place tab labels on bottom (only works on items within <Tab>)
   align-items:     center;    REM: ORIGINAL
   justify-content: center;    REM: ORIGINAL
 }
*/
</style>
