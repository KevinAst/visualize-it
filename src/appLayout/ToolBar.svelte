<script>
 import {Section}    from '@smui/top-app-bar';
 import IconButton   from '@smui/icon-button';
 import {activeTab}  from '../pkgEntryTabs';
 import DispMode     from '../core/DispMode';

 // our reflection is based on the active tab's PkgEntry
 // ... for PkgEntries, we utilize it's changeManager reflexive store
 //     NOTE: getTabContext() isA PkgEntry ONLY for TabControllerPkgEntry type
 //           ... otherwize the .changeManager will be undefined
 //               which is OK in this context (see sub-comments below)
 $: pkgEntry      = $activeTab    ? $activeTab.getTabContext() : null; // rougue value (when NON PkgEntry activeTab), null (when no activeTab)
 $: changeManager = pkgEntry      ? pkgEntry.changeManager     : null; // undefined (when NOT a PkgEntry type),       null (when no activeTab)
 $: dispMode      = changeManager ? $changeManager.dispMode    : null;
 $: undoAvail     = changeManager ? $changeManager.undoAvail   : false;
 $: redoAvail     = changeManager ? $changeManager.redoAvail   : false;

 $: selectedDispMode = dispMode;
 function handleDispModeChange() {
   // console.log(`xx handleDispModeChange(): ${selectedDispMode.enumKey}`);
   changeManager.changeDispMode(selectedDispMode);
 }
 // AI: handleDispModeChange() reflexivity is WORKING correctly, however I'm not exactly sure how ... hmmmm
 //     ... all reflexivity is triggered as changed (activate logs below and see for yourself)
 //     ... it has NOTHING to do with the logic of handleDispModeChange() ... can no-op it and reflexivity still occurs
 // $: console.log(`xx <ToolBar> $activeTab    changed: ${$activeTab    ? 'whatever'               : 'undefined'}`);
 // $: console.log(`xx <ToolBar> pkgEntry      changed: ${pkgEntry      ? pkgEntry.getPkgEntryId() : 'undefined'}`);
 // $: console.log(`xx <ToolBar> changeManager changed: ${changeManager ? 'whatever'               : 'undefined'}`);
 // $: console.log(`xx <ToolBar> dispMode      changed: ${dispMode      ? dispMode.enumKey         : 'undefined'}`);

 function handleUndo() {
   changeManager.applyUndo();
 }

 function handleRedo() {
   changeManager.applyRedo();
 }
</script>

<Section align="end" toolbar>

  <!-- items specific to activeTabs of PkgEntry types -->
  {#if changeManager}

    <!-- DispMode -->
    <select bind:value={selectedDispMode}
            on:change={handleDispModeChange}
            class="mdc-typography--subtitle2"
            title="Disp Mode">
      {#each Array.from(DispMode) as dm (dm.enumKey)}
        <option value={dm}
                disabled={!pkgEntry.canHandleDispMode(dm)}>{dm.enumKey}</option>
	    {/each}
    </select>
    
    <!-- Undo/Redo (only active in edit DispMode) -->
    {#if dispMode === DispMode.edit}
      <span>
        <IconButton class="material-icons"
                    disabled={!undoAvail}
                    title="Undo"
                    on:click={handleUndo}>undo</IconButton>
        <IconButton class="material-icons"
                    disabled={!redoAvail}
                    title="Redo"
                    on:click={handleRedo}>redo</IconButton>
      </span>
    {/if}

  {/if}

</Section>


<style>
 select { /* customize our DispMode selector */
   border:        2px solid #102027;  /* THEME: $mdc-theme-secondary-dark */
   border-radius: 0.5rem;
   font-size:     0.8rem;
   background-color: #26a69a;  /* THEME: $mdc-theme-primary */
 }

 span :global(button:disabled) { /* disabled button */
   color: #62727b;
 }
</style>
