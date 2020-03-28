import _changeManagerAct  from './actions';
import verify             from 'util/verify';

/**
 * ChangeManager is a service that manages change throuhout the system.
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
   *       injectDependency()).  This minimizes order dependancies.
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

}

// expose our single changeManager utility ... AI: singleton code smell
const changeManager = new ChangeManager();
export default changeManager;
