import TabControllerPkgEntry  from './TabControllerPkgEntry';
import pkgEntryTabManager     from './pkgEntryTabManager';
import PkgEntryTabs           from './PkgEntryTabs.svelte';

// extract public aspects out of our pkgEntryTabManager
const {activeTab, preregisterTab, getRegisteredTab, activateTab, closeTab} = pkgEntryTabManager;

// promote the pkgEntryTabs public API
export {

  //***
  //*** Component
  //***

  PkgEntryTabs, // simple usage: <PkgEntryTabs/>


  //***
  //*** classes
  //***

  TabControllerPkgEntry, // the concrete class that manages PkgEntry tabs


  //***
  //*** reactive svelte stores
  //***

  activeTab, // the current active tab (null for NO tabs) ... TabController


  //***
  //*** API
  //***

  preregisterTab,   // + preregisterTab(tabController): void    ... preregister the supplied `tabController` as a potential tab that can be rendered in our context
  getRegisteredTab, // + getRegisteredTab(tabId): TabController ... get the TabController registered to the supplied `tabId` (undefined for NOT registered)
  activateTab,      // + activateTab(tabId, preview=true): void ... activate the supplied tabId (visualizing it's content)
  closeTab,         // + closeTab(tabId): void                  ... close the tab of the supplied tabId
};
