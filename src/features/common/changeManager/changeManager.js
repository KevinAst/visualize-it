import _changeManagerAct  from './actions';
import verify             from 'util/verify';
import checkUnknownArgs   from 'util/checkUnknownArgs';
import {isString,
        isFunction,
        isSmartObject,
        isEPkg,
        isEqual}          from 'util/typeCheck';

/**
 * ChangeManager is a service that manages change throughout the system.
 */
class ChangeManager {

  /**
   * Create a ChangeManager.
   */
  constructor() {
    // carve out our state
    // ... injected by: changeManager feature.appInit()
    this.dispatch = null;
    this.requestCache = []; // actions
    this.undoRedoHash = {}; // hash of ... [pkgEntryId]: UndoRedoMgr
  }

  /**
   * Internal method that injects operational dependencies into self.
   *
   * This is invoked early in the startup process by changeManager
   * feature.appInit().
   *
   * @private
   */
  injectDependency(dispatch) {
    // retain operational dependencies
    this.dispatch = dispatch;

    // process any cached entries
    this.requestCache.forEach( (action) => this.dispatchAction(action) );
    this.requestCache = []; // clear the cache
  }

  /**
   * Internal method that will dispatch (or cache) the supplied action.
   *
   * NOTE: A cache is maintained, that holds actions to be processed,
   *       when this service is not yet operational (see:
   *       injectDependency()).  This minimizes order dependencies.
   *
   * @private
   */
  dispatchAction(action) {
    // cache request (when self it not yet operational)
    if (!this.dispatch) {
      this.requestCache.push(action);
    }
    // process request (when self is operational)
    else {
      this.dispatch(action);
    }
  }

  /**
   * Register the supplied `ePkg` to our changeManager.
   *
   * @param {EPkg} ePkg - the EPkg smartObject to register.
   */
  registerEPkg(ePkg) {
    // validate parameters
    const check = verify.prefix('changeManager.registerEPkg() parameter violation: ');
    // ... ePkg
    check(ePkg,          'ePkg is required');
    check(isEPkg(ePkg),  'ePkg must be an EPkg smartObject');

    // process request
    // ... dispatch action that will maintain this new state
    this.dispatchAction( _changeManagerAct.registerEPkg(ePkg.getEPkgId(), ePkg.getCrc(), ePkg.getBaseCrc()) );
  }

  /**
   * The supplied ePkg has changed.
   *
   * @param {EPkg} ePkg - the EPkg smartObject that has changed.
   */
  ePkgChanged(ePkg) {
    // validate parameters
    const check = verify.prefix('changeManager.ePkgChanged() parameter violation: ');
    // ... ePkg
    check(ePkg,          'ePkg is required');
    check(isEPkg(ePkg),  'ePkg must be an EPkg smartObject');

    // process request
    // ... dispatch action that will maintain this changed state
    this.dispatchAction( _changeManagerAct.ePkgChanged(ePkg.getEPkgId(), ePkg.getCrc(), ePkg.getBaseCrc()) );
  }

  /**
   * Apply the supplied change to our system -AND- register the change
   * to our undo/redo operation stack (associated to a given PkgEntry).
   * 
   * Changes are modeled as functions to be executed.  The API of
   * `changeFn()` / `undoFn()` is as follows:
   * 
   * ```js
   * + changeFn(redo: <boolean>): targetObj
   * + undoFn(): targetObj
   * ```
   * 
   * - The `redo` param is an indicator as to whether the invocation
   *   is a **redo** operation, verses the initial execution.
   *   Typically a redo requires more work (for example syncing
   *   **both** the SmartObject and Konva realms).
   * 
   * - Both functions return the targetObj of the operation.  This is
   *   used to seed the synchronization of other parts of the model
   *   ... via the `SmartModel.trickleUpChange()` method.
   * 
   * - These functions should be implemented in a way that DOES NOT
   *   reference stale objects!
   *   - when using undo/redo (over the course of time) objects may be
   *     "swapped out" via the synchronization process
   *   - the solution to this dilemma is to resolve all object references
   *     from their "id" AT RUN-TIME ... insuring you have the most current
   *     active object.
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

    // apply the initial change
    const targetObj = applyChange(check, changeFn, false/*NOT redo (rather our initial change)*/);

    // register our undo operation - associated to the target's PkgEntry
    const pkgEntryId = targetObj.getPkgEntry().getEPkgId(); // ex: 'com.astx.ACME/scene1'
    // console.log(`xx changeManager ... pkgEntryId: '${pkgEntryId}'`);
    this.registerUndoRedoOp(pkgEntryId, undoFn, changeFn);
  }

  /**
   * An internal method that registers the supplied undo/redo operation.
   *
   * @param {string} pkgEntryId - the PkgEntryId for which this
   * operation applies (ex: 'com.astx.ACME/scene1').
   * 
   * @param {function} undoFn - the function that "undoes" the low-level
   * change.
   * 
   * @param {function} redoFn - the function that applies the
   * low-level change.
   *
   * @private
   */
  registerUndoRedoOp(pkgEntryId, undoFn, redoFn) {
    // NOTE: No validate params (internal routine)

    // locate our UndoRedoMgr (create on first usage)
    let undoRedoMgr = this.undoRedoHash[pkgEntryId];
    if (!undoRedoMgr) {
      undoRedoMgr = this.undoRedoHash[pkgEntryId] = new UndoRedoMgr(pkgEntryId);
    }

    // register the supplied undo/redo operation
    const oldState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};
    undoRedoMgr.registerOp(undoFn, redoFn);
    const newState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};

    // maintain our redux state (when changed)
    if (!isEqual(oldState, newState)) {
      this.dispatchAction( _changeManagerAct.undoRedoChanged(pkgEntryId, newState.undoAvail, newState.redoAvail) );
    }
  }

  /**
   * Apply an "undo" operation to the supplied PkgEntry.
   *
   * @param {string} pkgEntryId - identifies the PkgEntry for which
   * this operation applies (ex: 'com.astx.ACME/scene1').
   */
  applyUndo(pkgEntryId) {
    // validate parameters
    const check = verify.prefix('*** ERROR *** changeManager.applyUndo(): ');
    // ... pkgEntryId
    check(pkgEntryId,           'parameter violation: pkgEntryId is required');
    check(isString(pkgEntryId), 'parameter violation: pkgEntryId must be a function');

    // locate our undoRedoMgr
    const undoRedoMgr = this.undoRedoHash[pkgEntryId];
    check(undoRedoMgr, `pkgEntryId: '${pkgEntryId}' has NO "change management" applied to it (cannot apply an undo operation)`);

    // apply the undo operation
    const oldState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};
    undoRedoMgr.applyUndo(check);
    const newState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};

    // maintain our redux state (when changed)
    if (!isEqual(oldState, newState)) {
      this.dispatchAction( _changeManagerAct.undoRedoChanged(pkgEntryId, newState.undoAvail, newState.redoAvail) );
    }
  }


  /**
   * Apply an "redo" operation to the supplied PkgEntry.
   *
   * @param {string} pkgEntryId - identifies the PkgEntry for which
   * this operation applies (ex: 'com.astx.ACME/scene1').
   */
  applyRedo(pkgEntryId) {
    // validate parameters
    const check = verify.prefix('*** ERROR *** changeManager.applyRedo(): ');
    // ... pkgEntryId
    check(pkgEntryId,           'parameter violation: pkgEntryId is required');
    check(isString(pkgEntryId), 'parameter violation: pkgEntryId must be a function');

    // locate our undoRedoMgr
    const undoRedoMgr = this.undoRedoHash[pkgEntryId];
    check(undoRedoMgr, `pkgEntryId: '${pkgEntryId}' has NO "change management" applied to it (cannot apply an redo operation)`);

    // apply the redo operation
    const oldState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};
    undoRedoMgr.applyRedo(check);
    const newState = {undoAvail: undoRedoMgr.isUndoAvail(), redoAvail: undoRedoMgr.isRedoAvail()};

    // maintain our redux state (when changed)
    if (!isEqual(oldState, newState)) {
      this.dispatchAction( _changeManagerAct.undoRedoChanged(pkgEntryId, newState.undoAvail, newState.redoAvail) );
    }
  }

}

// expose our single changeManager utility ... AI: singleton code smell
const changeManager = new ChangeManager();
export default changeManager;


/**
 * UndoRedo is an internal class that manages undo/redo operations for
 * a given PkgEntry.
 *
 * @param {string} pkgEntryId - the PkgEntryId for which self's undo/redo
 * operations apply (ex: 'com.astx.ACME/scene1').
 *
 * @private
 */
class UndoRedoMgr {

  /**
   * Create an UndoRedo instance.
   */
  constructor(pkgEntryId) {
    // carve out our state
    this.pkgEntryId = pkgEntryId;
    this.stack = []; // [ [undoFn, redoFn], ... ]
    this.cur = -1;   // points to the actual current stack entry (-1 for NO entries)
  }

  /**
   * Register the supplied undo/redo operation to self's PkgEntry.
   * 
   * @param {function} undoFn - the function that "undoes" the low-level
   * change.
   * 
   * @param {function} redoFn - the function that applies the
   * low-level change.
   */
  registerOp(undoFn, redoFn) {
    // prune any "active" redos
    // ... when "undos" have been applied, there are active "redos" that are no longer possible
    //     BECAUSE of this new user-supplied operation
    while (this.isRedoAvail()) {
      this.stack.pop();
    }

    // register our new entry
    this.stack.push([undoFn, redoFn]);
    this.cur = this.stack.length - 1;
  }

  /**
   * Return an indicator as to whether self's PkgEntry has "undos" available.
   * 
   * @returns {boolean} `true`: "undos" are available, `false` otherwise.
   */
  isUndoAvail() {
    // undo is available whenever we have active entries
    // ... NOTE: we use index NOT this.stack.length BECAUSE 
    //           the stack (array) is preserved during active undo (for redo activation)
    return this.cur >= 0;
  }

  /**
   * Apply an "undo" operation to self's PkgEntry.
   *
   * @param {function} check the check function on who's behalf we are
   * operating.
   */
  applyUndo(check) {
    check(this.isUndoAvail(), `pkgEntryId: '${this.pkgEntryId}' DOES NOT currently have an "undo" operation available`);

    // locate undoFn
    const [undoFn/*, redoFn*/] = this.stack[this.cur];
    this.cur--;

    // apply the undoFn
    applyChange(check, undoFn, undefined/*redo: N/A for undo*/);
  }

  /**
   * Return an indicator as to whether self's PkgEntry has "redos" available.
   * 
   * @returns {boolean} `true`: "redos" are available, `false` otherwise.
   */
  isRedoAvail() {
    // redo is available when an "active" undo has been applied
    // ... i.e. an undo executed -AND- no other changes have been executed
    return this.cur < this.stack.length-1;
  }

  /**
   * Apply an "redo" operation to self's PkgEntry.
   *
   * @param {function} check the check function on who's behalf we are
   * operating.
   */
  applyRedo(check) {
    check(this.isRedoAvail(), `pkgEntryId: '${this.pkgEntryId}' DOES NOT currently have a "redo" operation available`);

    // locate the redoFn
    this.cur++;
    const [/*undoFn*/, redoFn] = this.stack[this.cur];

    // apply the redoFn
    applyChange(check, redoFn, true/*redo: this is truly a redo!!*/);
  }

}


/**
 * Utility function that manages the details of any change (initial,
 * undo, or redo).
 *
 * @param {function} check the check function on who's behalf we are
 * operating.
 * 
 * @param {function} changeFn - the function that will apply the
 * change (this can be the initial/redo or undo function).
 * 
 * @param {boolean} redo - an indicator as to whether this is a redo
 * operation.
 */
function applyChange(check, changeFn, redo=false) {
  // apply the change by invoking the app-level change function
  // ... the redo param is only applicable for redoFn()
  //     however it doesn't hurt to pass an additional param on undoFn() :-)
  const targetObj = changeFn(redo);
  check(isSmartObject(targetObj), 'the execution of app-level change functions (registered to changeManager) MUST return a targetObj that is a SmartObject (type: SmartModel)');

  // trickle up this low-level change, syncing our parentage 
  targetObj.trickleUpChange();

  // that's all folks
  return targetObj;
}


