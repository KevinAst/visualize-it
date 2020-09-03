import {isSmartObject}  from '../../util/typeCheck';

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
 * @param {boolean} redoIndicator - an indicator as to whether this is a redo
 * operation.
 *
 * @private
 */
export default function applyChange(check, ePkg, changeFn, redoIndicator=false) {

  // apply the change by invoking the app-specific change function
  // NOTE: The redoIndicator param is only applicable for redoFn()
  //       however it doesn't hurt to pass an additional param on undoFn() :-)
  const targetObj = changeFn(redoIndicator);
  check(isSmartObject(targetObj), 'the execution of app-specific change functions (registered to ChangeManager) ' +
                                  'MUST return a targetObj that is a SmartObject (type: SmartModel)');
  // AI: following check assumes we are changing some pare of a PkgEntry - we may eventually use this for changes to SmartPkg too (such as it's name) ... not really sure
  check(ePkg === targetObj.getPkgEntry(), 'the execution of app-specific change functions (registered to ChangeManager) ' + 
                                          `MUST return a targetObj that has lineage in the '${ePkg.getEPkgId()}' EPkg (on who's behalf we are operating)`);

  // trickle up this low-level change, syncing our parentage -and- the ChangeMonitor state
  targetObj.trickleUpChange();

  // that's all folks
}


