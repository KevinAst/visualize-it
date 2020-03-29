import _changeManagerAct  from './actions';
import verify             from 'util/verify';
import checkUnknownArgs   from 'util/checkUnknownArgs';
import {isFunction}       from 'util/typeCheck';

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
    check(ePkg.isEPkg,   'ePkg must be a SmartPkg instance');
    check(ePkg.isEPkg(), 'ePkg must be an EPkg instance');

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
    check(ePkg.isEPkg,   'ePkg must be a SmartPkg instance');
    check(ePkg.isEPkg(), 'ePkg must be an EPkg instance');

    // process request
    // ... dispatch action that will maintain this changed state
    this.dispatchAction( _changeManagerAct.ePkgChanged(ePkg.getEPkgId(), ePkg.getCrc(), ePkg.getBaseCrc()) );
  }

  /**
   * Apply the supplied change within our system.  The change is
   * modeled as functions to be executed, providing the opportunity to
   * register them for future undo/redo operations.
   *
   * The API of `changeFn()` / `undoFn()` is as follows:
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
   *   ... via the `trickleUpChange()` method.
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
    // console.log('xx changeManager ... applying initial change');
    const targetObj = changeFn(false); // redo: false (this is the initial execution)
    check(targetObj,             'changeFn() execution must return a targetObj');
    check(targetObj.toSmartJSON, 'changeFn() execution must return a targetObj that is a SmartObject (type: SmartModel)');

    // trickle up this low-level change, syncing our parentage 
    targetObj.trickleUpChange();

    // register our undo operation - associated to the target's EPkg
    //?? const ePkgId = targetObj.getParentEPkg().getEPkgId(); // ?? both getters are NEW
    //?? this.registerUndo(ePkgId, changeFn, undoFn);

    // ?? temp test of basic undo/redo
    //? setTimeout( () => { // undo in 3 seconds
    //?   //console.log('xx changeManager ... applying undo');
    //?   const target = undoFn();
    //?   target.trickleUpChange();
    //? }, 3000);
    //? setTimeout( () => { // redo in 6 seconds
    //?   //console.log('xx changeManager ... applying redo()');
    //?   const target = changeFn(true); // redo: true 
    //?   target.trickleUpChange();
    //? }, 6000);
  }

}

// expose our single changeManager utility ... AI: singleton code smell
const changeManager = new ChangeManager();
export default changeManager;
