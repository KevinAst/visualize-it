import {isSmartObject, isPkgEntry}  from '../../util/typeCheck';

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
 * change (this can be the initial/redo or undo function).
 *
 * @private
 */
export default function applyChange(check, ePkg, changeFn) {

  // verify our ePkg is a pkgEntry
  // ... in current usage ePkg IS a pkgEntry which in-turn is a SmartPallet (Scene/Collage/CompRef)
  //     AI: this will need adjusting if we ever manage SmartPkg changes (the other ePkg type)
  check(isPkgEntry(ePkg), 'currently applyChange() only supports PkgEntry ePkg entries (not SmartPkg)');
  const pkgEntry = ePkg; // ... convenient aliases
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
  // AI: following check assumes we are changing some part of a PkgEntry - we may eventually use this for changes to SmartPkg too (such as it's name) ... not really sure
  check(ePkg === targetObj.getPkgEntry(), 'the execution of app-specific change functions (registered to ChangeManager) ' + 
                                          `MUST return a targetObj that has lineage in the '${ePkg.getEPkgId()}' EPkg (on who's behalf we are operating)`);

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


