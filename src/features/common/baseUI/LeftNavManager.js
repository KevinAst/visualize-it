import React              from 'react';
import LeftNavMenuPallet  from './comp/LeftNavMenuPallet';
import SmartPkg           from 'core/SmartPkg';
import verify             from 'util/verify';


/**
 * LeftNavManager is an agent managing LeftNav items.
 */
class LeftNavManager {

  /**
   * Create a LeftNavManager.
   */
  constructor() {

    // carve out our state
    // ... injected by: baseUI feature.appInit()
    // ... all other state managed by redux
    this.fassets  = null;
    this.dispatch = null;
    this.leftNavCache = []; // SmartPkg[]
  }

  /**
   * Internal method that injects operational dependencies into self
   * ... invoked early in the startup process by feature.appInit()
   * @private
   */
  injectDependency(fassets, dispatch) {

    // retain operational dependencies
    this.fassets  = fassets;
    this.dispatch = dispatch;

    // process any cached entries (waiting to be operational)
    this.leftNavCache.forEach( (smartPkg) => this.processAddLeftNav(smartPkg) );
    this.leftNavCache = []; // clear the cache
  }

  /**
   * Internal method that processes addLeftNav() requests.
   * @private
   */
  processAddLeftNav(smartPkg) {
    // cache request, when self it not yet operational
    if (!this.fassets) {
      this.leftNavCache.push(smartPkg);
    }
    // process request
    else {
      this.dispatch( this.fassets.actions.addLeftNavItem(smartPkg.getPkgName(), () => (
        <LeftNavMenuPallet smartPkg={smartPkg}/>
      )) );
    }
  }

  /**
   * Display the supplied package in the LeftNav menu.
   *
   * NOTE: To be operational, this method requires the injection of
   *       fassets/dispatch (see: injectDependency()). If invoked
   *       prior to this, the request will be cached, to be executed
   *       later (minimizing feature order dependency).
   *
   * @param {SmartPkg} smartPkg - the package to be registered.
   */
  addLeftNav(smartPkg) {

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}.addLeftNav() parameter violation: `);

    // ... smartPkg
    check(smartPkg,                     'smartPkg is required');
    check(smartPkg instanceof SmartPkg, 'smartPkg must be a SmartPkg instance');

    // process request
    this.processAddLeftNav(smartPkg);
  }

  // AI: + removeLeftNav(smartPkg?): void <<< L8TR
}

// expose our single leftNavManager utility ... AI: singleton code smell ... see if fassets entry will suffice (if this works can simply be the standard action)
const leftNavManager = new LeftNavManager();
export default leftNavManager;
