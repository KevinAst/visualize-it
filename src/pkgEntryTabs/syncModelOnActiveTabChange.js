import pkgEntryTabManager from './pkgEntryTabManager';
import {isPkgEntry}       from '../util/typeCheck';
import {createLogger}     from '../util/logger';

// our internal diagnostic logger
const log = createLogger('***DIAG*** pkgEntryTabs/syncModelOnActiveTabChange ... ').disable();

// the current active tab (null for NO tabs) ... a reactive svelte store of TabController
const {activeTab} = pkgEntryTabManager;

log('monitoring activeTab changes');

// monitor activeTab changes
activeTab.subscribe( ($activeTab) => {

  // resolve the pkgEntry from our activeTab (if any)
  // ... rouge value (for NON PkgEntry activeTab)
  // ... null (when no activeTab)
  const pkgEntry = $activeTab ? $activeTab.getTabContext() : null;
  // ... no-op for NON PkgEntry activeTab
  if (!isPkgEntry(pkgEntry)) {
    return;
  }

  /**
   * Synchronize the Konva DispMode whenever a NEW tab is
   * introduced, so that it matches our object model.
   * 
   * BACKGROUND: Normally a DispMode starts out in a 'view" mode.
   *             HOWEVER: If we close a tab that was in edit mode (as an example), 
   *                      and then bring the tab back (from the LeftNav)
   *                      the Konva model will NOT match our object model
   *                      without this logic.
   */

  // when a new tab is introduced (i.e. it is not yet mounted) ...
  if (!pkgEntry.isMounted()) {
    // re-sync our Konva DispMode to match the object model
    // NOTE: Because this Konva state is maintained on mount,
    //       we must wait till the mount occurs
    //       HACK: timeout postponement for mount to occur
    setTimeout( () => {
      log(`activateTab: ${pkgEntry.getName()} - a NEW TAB CREATED ... SYNC Konva DispMode to match our object model!`);
      pkgEntry.changeManager.changeDispMode( pkgEntry.getDispMode() );
    }, 10);
  }


  /**
   * Synchronize any out-of-date class references each time a tab is
   * activated.
   *
   * Class versioning can become out-of-sync when interactive edits
   * occur to the class master (visualized in a separate tab).
   *
   * Currently, this is only operational for pseudo classes.  Real
   * code-based class versioning is not currently tracked, and will
   * therefore always be in-sync.
   */

  // when package is out-of-sync ...
  if (pkgEntry.areClassesOutOfSync()) {
    log(`activateTab: ${pkgEntry.getName()} - some sub-classes are out-of-sync!`);
    
    // locate the top-level SmartView
    const view = pkgEntry.getView();
    const containingHtmlElm = view.containingHtmlElm;
    
    // when view is already visible in a tab (i.e. mounted)
    if (view.isMounted()) {
      log(`    view was previously visible ... do: unmount/sync/mount!`);
      // unmount the Konva visuals
      view.unmount();

      // sync our object model
      pkgEntry.syncClassInstances();

      // re-mount the Konva visuals
      view.mount(containingHtmlElm);

      // re-establish our pkgEntry DispMode
      // ... this resets all our event handlers given the re-mount :-)
      pkgEntry.changeManager.changeDispMode( pkgEntry.getDispMode() );
    }
    // otherwise (not mounted)
    else {
      log(`    view was NOT visible ... do: sync only!`);
      // the only thing we have to do is sync our object model
      pkgEntry.syncClassInstances();
    }
  }
  else {
    log(`activateTab: ${pkgEntry.getName()} - all sub-classes are in-sync ... nothing to do!`);
  }

});
