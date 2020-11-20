import {isSmartObject, isPkgEntry, isArray}  from '../../util/typeCheck';

/**
 * Utility function that manages the details of any change (initial,
 * undo, or redo).
 *
 * @param {function} check the check function on who's behalf we are
 * operating.
 *
 * @param {EPkg} ePkg - the EPkg smartObject on whose behalf we
 * manage/monitor.
 * 
 * @param {function} changeFn - the function that will apply the
 * change (this can be the initial, redo, or undo function).
 *
 * @private
 */
export default function applyChange(check, ePkg, changeFn) {

  // route functionality to the specific EPkg tasks:
  if (isPkgEntry(ePkg)) { // ... PkgEntry
    applyChangeForPkgEntry(check, ePkg, changeFn);
  }
  else { // ... Pkg (SmartPkg)
    applyChangeForPkg(check, ePkg, changeFn);
  }
}

// internal applyChange() route for PkgEntries
function applyChangeForPkgEntry(check, ePkg, changeFn) {

  // convenient aliases
  const pkgEntry = ePkg;
  const pallet   = ePkg;

  // PART I: re-sync the graphical representation (i.e. the Konva state)
  //         - employing a mount/unmount, repainting the entire graphics (a bit of a sledge hammer)
  //         - two-phase sync is needed to catch things like removing objects
  //           * a single-phase sync (after SmartObject mod), 
  //             will NOT remove konva rep (via unmount) because it is NOT found
  //           * a single-phase sync COULD work if we pushed up the unmount/mount
  //             to the view level, but that is not really needed
  const containingKonvaStage = pallet.containingKonvaStage;
  pallet.unmount();

  // apply the change to our SmartObject model by invoking the app-specific change function
  const targetObj = changeFn();
  check(isSmartObject(targetObj), 'the execution of app-specific change functions (registered to ChangeManager) ' +
                                  'MUST return a targetObj that is a SmartObject (type: SmartModel)');
  check(pkgEntry === targetObj.getPkgEntry(), 'the execution of app-specific change functions (registered to ChangeManager for PkgEntries) ' + 
                                              `MUST return a targetObj that has lineage in the '${pkgEntry.getEPkgId()}' PkgEntry (on who's behalf we are operating)`);

  // PART II: re-sync the graphical representation (i.e. the Konva state)
  pallet.mount(containingKonvaStage);

  // re-establish our pkgEntry DispMode
  // ... this resets all our event handlers given the re-mount :-)
  pkgEntry.changeManager.changeDispMode( pkgEntry.getDispMode() );

  // trickle up this low-level change, auto-syncing required state
  // ... this must happen after re-mounts (because size is calculated from mounted konva state)
  targetObj.trickleUpChange();

  // that's all folks
}

// internal applyChange() route for Pkgs (SmartPkg)
function applyChangeForPkg(check, ePkg, changeFn) {

  // convenient aliases
  const pkg = ePkg; // ... we are servicing SmartPkg
  
  // apply the change to our SmartObject model by invoking the app-specific change function
  const changeFnReturn = changeFn();
  const targetObjs = isArray(changeFnReturn) ? changeFnReturn : [changeFnReturn];
  targetObjs.forEach( (targetObj) => {
    check(isSmartObject(targetObj), 'the execution of app-specific change functions (registered to ChangeManager) ' +
                                    'MUST return a targetObj that is a SmartObject (type: SmartModel)');
    check(pkg === targetObj.getPkg(), 'the execution of app-specific change functions (registered to ChangeManager for SmartPkgs) ' + 
                                      `MUST return a targetObj that has lineage in the '${pkg.getEPkgId()}' SmartPkg (on who's behalf we are operating)`);
  });


  // resync the parentage of the Pkg directory structure
  // ... because the directory structure may change
  //     EX: moving entries/directories to different parts of the structure
  pkg.rootDir.syncParent(pkg);

  // trickle up this low-level change, auto-syncing required state
  // ... a trickle-up IS required to reflect changes in CRC within the entire tree
  //     (for example: directories and sub-directories)
  targetObjs.forEach( (targetObj) => {
    targetObj.trickleUpChange();
  });

  // synchronize our GUI to reflect the package structure changes
  // ... we do this outside of trickleUpChange() so as to be specific to SmartPkg
  //     and to only invoke ONCE
  //     ... for SmartPkg changes, trickleUpChange() can occur multiple times 
  //         via array processing (see prior step)
  if (pkg.syncPkgStructureGuiChanges) {
    pkg.syncPkgStructureGuiChanges();
  }
  else {
    console.warn(`*** WARNING *** changeManager.applyChange() could NOT sync GUI package structure changes - expecting SmartPkg to have syncPkgStructureGuiChanges() method (from ViewPkg.svelte) but was NOT registered.`);
  }

  // that's all folks
}
