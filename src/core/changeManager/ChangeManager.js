import {writable, get}  from 'svelte/store';
import UndoRedoMgr      from './UndoRedoMgr';
import applyChange      from './applyChange';
import verify           from '../../util/verify';
import checkUnknownArgs from '../../util/checkUnknownArgs';
import {isEPkg,
        isFunction}     from '../../util/typeCheck';

// ??$$$ Change Manage should NOW fully support EPKG (both SmartPkg and PkgEntry) ... retrofit code (and variables throughout)
//       DONE: may ONLY AFFECT: changeDispMode()
//       ?? research all pkgentry comment/vars
//       ?? fully implement through LeftNav "Edit Package Structure"

/**
 * ChangeManager is a reactive custom store that manages and monitors
 * changes in an EPkg:
 * - either a pkg (SmartPkg)                             ... ex: 'com.astx.ACME'
 * - or a     pkgEntry (top-level entries of a SmartPkg) ... ex: 'com.astx.ACME/scene1'
 *
 * ChangeManager objects are retained in the corresponding EPkg
 * smartObject, as a convenient cataloging mechanism.
 *
 * **Auto Synchronization**:
 *
 * ChangeManager greatly simplifies the change process by
 * automatically applying the required synchronization to the:
 *
 *  - graphical representation (i.e. the Konva state)
 *    ... app logic focuses on SmartObject changes,
 *        and ChangeManager auto syncs the visual graphics
 *
 *  - SmartObject parentage
 *    ... app logic merely changes a "focused" target object
 *        and ChangeManager auto syncs it's parentage.
 *        This is accomplished via SmartObject.trickleUpChange(),
 *        propagating things like crc computations, and dynamic container size.
 *
 *  - ChangeMonitor state (see ChangeMonitor Object below)
 *    ... of course self's reflective ChangeMonitor state is auto synced.
 *        This is accomplished through the syncMonitoredChange() method,
 *        invoked at the appropriate places.
 *
 *
 * **API**:
 *
 * There are two distinct APIs you should be aware of (as in all
 * svelte custom stores):
 * 
 * 1. ChangeManager Object (this object [i.e. the svelte custom store]):
 * 
 *    For details, please refer to the method JavaDocs (below)
 *    ```js
 *    + changeDispMode(dispMode): void        - change the dispMode of self's PkgEntry (view/edit/animate)
 *
 *    + syncMonitoredChange(): void           - synchronize self's ChangeMonitor (store value), 
 *                                              due to a change that has just been made to self's ePkg
 *                                              impacting items monitored by ChangeManger {dispMode, inSync, undoAvail, redoAvail},
 *                                              for example:
 *                                              * CRC computations (impacting: {inSync, undoAvail, redoAvail}):
 *                                                - SmartObject.resetCrc():     void ... via SmartObject.trickleUpChange() driven by changeManager.applyChange()
 *                                                - SmartObject.resetBaseCrc(): void ... via SmartPkg-constructor() and pkgPersist-savePkg()
 *                                              * DispMode changes (impacting: {dispMode}):
 *                                                - changeManager.changeDispMode(dispMode)
 *
 *    + applyChange({changeFn, undoFn}): void - apply a change to our system, registering the change to our undo/redo stack,
 *                                              auto-syncing required state (see "Auto Synchronization" above).
 *
 *    + applyUndo(): void                     - apply an "undo" operation to the PkgEntry on whose behalf we are managing,
 *                                              auto-syncing required state (see "Auto Synchronization" above).
 *
 *    + applyRedo(): void                     - apply an "redo" operation to the PkgEntry on whose behalf we are managing,
 *                                              auto-syncing required state (see "Auto Synchronization" above).
 *    ```
 *
 * 2. ChangeMonitor Object (the store value, accessible via
 *    subscription or the auto-subscription `$` prefix):
 *
 *    ```js
 *    + dispMode: DispMode enum - the current pkgEntry's DispMode (view/edit/animate)
 *
 *    + inSync: boolean - is self's ePkg "in sync" with it's base version (saved on disk)
 *    + inSyncIcon(): string - name of icon to qualify "in sync" status ('NONE' for in-sync - can be fed directly into <Icon>)
 *
 *    + undoAvail: boolean - are undo operations available to self's ePkg
 *    + redoAvail: boolean - are redo operations available to self's ePkg
 *    ```
 *
 * **NOTE about real classes**:
 *
 *   You may have never seen a real JavaScript class used as a svelte
 *   custom store.  **Yes** it is possible, as long has it has the
 *   `subscribe()` method.  In this usage scenario, my preference is to
 *   use real classes because we have many ChangeManager instances, and
 *   we can share the method definitions between these multiple
 *   instances.
 */

export default class ChangeManager {

  /**
   * Create a ChangeManager (a reactive custom store) that manages and
   * monitors changes in the supplied ePkg.
   *
   * For standard reference purposes, this new object instance is
   * retained in `ePkg.changeManager`.
   *
   * @param {EPkg} ePkg - the EPkg smartObject on whose behalf we
   * manage/monitor.
   * - either a pkg (SmartPkg)                             ... ex: 'com.astx.ACME'
   * - or a     pkgEntry (top-level entries of a SmartPkg) ... ex: 'com.astx.ACME/scene1'
   */
  constructor(ePkg) {
    // validate parameters
    const check = verify.prefix('ChangeManager() constructor parameter violation: ');
    // ... ePkg
    check(ePkg,          'ePkg is required');
    check(isEPkg(ePkg),  'ePkg must be an EPkg smartObject');

    // maintain the linkage between self and ePkg
    this.ePkg          = ePkg;
    ePkg.changeManager = this;

    // register our undo/redo manager
    // ... auto maintains this.undoRedoMgr
    new UndoRedoMgr(this);
    
    // create our underlying base writable store
    this.baseStore = writable({ // *** initial ChangeMonitor store value ***
      dispMode: this.ePkg.getDispMode(),

      inSync:               this.ePkg.isInSync(),
      inSyncIcon() {
        return this.inSync ? 'NONE' : 'fiber_manual_record'; // a circle :-)
      },

      undoAvail: this.undoRedoMgr.isUndoAvail(),
      redoAvail: this.undoRedoMgr.isRedoAvail(),
    });
    
    // demark this object as a svelte custom store
    this.subscribe = this.baseStore.subscribe;
  }

  /**
   * Change self's EPkg to the supplied dispMode (view/edit/animate).
   *
   * NOTE: Technically, only EPkg objects utilize DispMode, however 
   *       all SmartObjects have a dispMode (a bit of an overkill).
   *
   * @param {DispMode} dispMode - the display mode to set.
   */
  changeDispMode(dispMode) {
    // validate parameters
    // ... this is indirectly accomplished in the .setDispMode() invocation (below)

    // apply the change (only when out-of-sync)
    // NOTE: There are cases where we want to issue a
    //       `pkgEntry.setDispMode()` EVEN when it has NOT changed
    //       ... see: src/pkgEntryTabs/syncModelOnActiveTabChange.js
    //       THIS is OK to do this, as we will NOT reflex unless it has
    //       actually changed :-)
    //       ... see: this.syncMonitoredChange()
    // console.log(`xx ChangeManager.changeDispMode(${dispMode.enumKey}) ... applying change`);
    this.ePkg.setDispMode(dispMode);

    // update our reflexive monitor
    this.syncMonitoredChange();
  }

  /**
   * Synchronize self's ChangeMonitor (store value), due to a change
   * that has just been made to self's ePkg.
   */
  syncMonitoredChange() {

    // resolve the latest (most current) state that we are tracking
    const dispMode  = this.ePkg.getDispMode();
    const inSync    = this.ePkg.isInSync();
    const undoAvail = this.undoRedoMgr.isUndoAvail();
    const redoAvail = this.undoRedoMgr.isRedoAvail();

    // pre-fetch current state of our monitor
    // ... used to determine if our monitor needs to change
    const monitorState = get(this.baseStore);
    
    // update our ChangeMonitor store value (triggering reactivity)
    // ... only when it has changed
    //     NOTE: The mere act of invoking store.update() WILL mark the store as changed.
    //           EVEN when returning the original state, the store is considered to have changed!
    //           ONLY WAY AROUND THIS is to do a prelim fetch (see get() above)
    //             1. potential concurrent change conflicts (min chance of happening)
    //             2. a bit more overhead
    if (dispMode  !== monitorState.dispMode  ||
        inSync    !== monitorState.inSync    ||
        undoAvail !== monitorState.undoAvail ||
        redoAvail !== monitorState.redoAvail) {
      this.baseStore.update( (state) => ({...state, dispMode, inSync, undoAvail, redoAvail}) );
    }
  }

  /**
   * Apply a change to our system, registering the change to our
   * undo/redo stack, auto-syncing required state (see "Auto
   * Synchronization" above).
   * 
   * - Changes are registered to the PkgEntry on whose behalf we
   *   manage/monitor (i.e. this.ePkg).  This must be consistent with
   *   the PkgEntry of the targetObj returned from the `changeFn()` /
   *   `undoFn()`.
   *
   * - Changes are modeled as functions to be executed.  The API of
   *   `changeFn()` / `undoFn()` is as follows:
   *   
   *   ```js
   *   + changeFn(): targetObj
   *   + undoFn():   targetObj
   *   ```
   * 
   * - Both functions return the targetObj of the operation.  This is
   *   used to seed the synchronization of other parts of the model
   *   ... via the `SmartModel.trickleUpChange()` method.
   * 
   * - These change functions should be implemented in a way that DOES NOT
   *   reference stale objects!
   *   - when using undo/redo (over the course of time) objects may be
   *     "swapped out" via the synchronization process
   *   - the solution to this dilemma is to resolve all object references
   *     from their "id" AT RUN-TIME ... insuring you have the most current
   *     active object.
   *
   * - Also, these change functions should only be concerned with the
   *   modification of a given low-level SmartObject.  ChangeManager
   *   will orchestrate additional detail to insure conformity (see
   *   "Auto Synchronization" above).
   *
   * **Please Note** this service uses named parameters.
   * 
   * @param {function} changeFn - the function that applies the
   * low-level change.
   * 
   * @param {function} undoFn - the function that "undoes" the low-level
   * change.  A guarantee is made that the object state will be as it was
   * immediately after the `changeFn()` execution.
   */
  applyChange({changeFn, undoFn, ...unknownArgs}={}) {
    // validate parameters
    const check = verify.prefix('changeManager.applyChange() parameter violation: ');
    // ... changeFn
    check(changeFn,             'changeFn is required');
    check(isFunction(changeFn), 'changeFn must be a function');
    // ... undoFn
    check(undoFn,             'undoFn is required');
    check(isFunction(undoFn), 'undoFn must be a function');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // register these change functions to our UnDoRedoMgr
    // NOTE: This MUST be done prior to applyChange(), so as to sync undo/redo monitor state in one swoop
    // NOTE: The changeFn IS our redoFn
    this.undoRedoMgr.registerOp(undoFn, changeFn);

    // apply the initial change
    applyChange(check, this.ePkg, changeFn);
  }


  /**
   * Apply an "undo" operation to the PkgEntry on whose behalf we are
   * managing, auto-syncing required state (see "Auto Synchronization"
   * above).
   */
  applyUndo() {
    // simply propagate request into our undoRedoMgr
    this.undoRedoMgr.applyUndo();
  }


  /**
   * Apply an "redo" operation to the PkgEntry on whose behalf we are
   * managing, auto-syncing required state (see "Auto Synchronization"
   * above).
   */
  applyRedo() {
    // simply propagate request into our undoRedoMgr
    this.undoRedoMgr.applyRedo();
  }

}
