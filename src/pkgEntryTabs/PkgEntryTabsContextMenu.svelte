<script>
 import {SelectionGroup,
         SelectionGroupIcon} from '@smui/menu';
 import {Item, 
         Text,
         Separator}          from '@smui/list';
 import pkgEntryTabManager   from './pkgEntryTabManager';
 import DispMode             from '../core/DispMode';
 import {createLogger}       from '../util/logger';

 // accept component props
 export let tab; // ... the TabController we are working on behalf of

 // extract the various controls needed from our very own tabManager (pkgEntryTabManager)
 const {activeTab, activateTab} = pkgEntryTabManager;

 // extract needed characteristics from the supplied tab
 const tabId         = tab.getTabId();
 const pkgEntry      = tab.getTabContext();
 const changeManager = pkgEntry.changeManager;

 // DispMode management
 $: currentDispMode = $changeManager.dispMode;
 function handleDispModeChange(requestedDispMode) {
   const log = createLogger(`***DIAG*** <PkgEntryTabsContextMenu> handleDispModeChange(${requestedDispMode}) ` +
                            `for tab: ${tabId} with currentDispMode: ${currentDispMode} ... `).disable();

   // change this Tab's PkgEntry's DispMode
   if (requestedDispMode !== currentDispMode) {
     log('changing the DispMode');
     changeManager.changeDispMode(requestedDispMode);
   }
   else {
     log('detected NO change in the DispMode');
     return; // don't go any further if NO change
   }

   // ALSO activate this tab, when the context menu's tab is not currently active
   // ... even when dispMode has NOT changed
   if (tab !== $activeTab) {
     log('ALSO making this tab active :-)');
     activateTab(tabId, /*preview*/true); // use preview (if we are already non-preview it WORKS)
   }
 }
</script>

<!-- here is the additional context menu items, specific to PkgEntries -->
<Item disabled><Text>Display Mode:</Text></Item>
<SelectionGroup>
  {#each Array.from(DispMode) as dm (dm.enumKey)}
    <Item on:SMUI:action={() => handleDispModeChange(dm)}
          disabled={!pkgEntry.canHandleDispMode(dm)}
          selected={currentDispMode === dm}>
      <SelectionGroupIcon><i class="material-icons">check</i></SelectionGroupIcon>
      <Text>{dm.enumKey}</Text>
    </Item>
	{/each}
</SelectionGroup>
<Separator/>
