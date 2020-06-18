import TabManager, 
       {activateTab,
        closeTab,
        monitorActiveTab,}        from './TabManager.svelte';
import TabController              from './TabController';
import TabControllerPkgEntry      from './TabControllerPkgEntry';
import tabRegistry                from './tabRegistry';

// promote tabManager public API
export {
  TabManager, // <TabManager> "singleton" component TO BE instantiated ONE TIME (within appLayout feature)

  TabController,         // abstract base class providing API for Tabs interaction to app-specific object model
  TabControllerPkgEntry, // concrete TabController derivation managing PkgEntry tabs

  tabRegistry, // with + tabRegistry.registerTab(tabController): void

  activateTab,      // + activateTab(tabId, preview=true): void ... activate tab preregistered to given tabId
  closeTab,         // + closeTab(tabId): void ... close tab of given tabId
  monitorActiveTab, // + monitorActiveTab(tabActivatedCB): void ... monitor active tab via: + tabActivatedCB(tabController | null<no-active-tab>): void
};
