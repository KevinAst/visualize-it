import TabController from './TabController';
import verify        from '../util/verify';
import {isString}    from '../util/typeCheck';

/**
 * TabRegistry provides a registry of ALL tabs (i.e. TabControllers).
 *
 * Tab registration occurs early.  Registered entries have the
 * "potential" of being displayed.
 *
 * When a tab is initially referenced (a dynamic process), it is
 * initially visualized through the `TabController.getTabPanel()` API.
 * 
 * Once a tab has been displayed, all interaction to it's app-specific
 * logic funnels through the TabController API.
 */
class TabRegistry {

  /**
   * Create a TabRegistry.
   */
  constructor() {
    // carve out our tabRegistry
    this.tabRegistry = {
      // [tabId]: tabController,
      // ...
    };
  }

  /**
   * Register the supplied `tabController` as a potential tab that can
   * be rendered in our system.
   *
   * @param {TabController} tabController the controller to register.
   * NOTE: The tabController models both the tabId and tabName.
   *
   * @throws {Error} an Error is thrown for invalid params (NOT: or
   * when the controller has already been registered).
   */
  registerTab(tabController) {

    // validate parameters
    const check = verify.prefix('TabRegistry.registerTab() parameter violation: ');
    // ... tabController
    check(tabController,                          'tabController is required');
    check(tabController instanceof TabController, 'tabController must be a TabController instance');

    // maintain our tabRegistry catalog
    const tabId = tabController.getTabId();
    // console.log(`xx TabRegistry.registerTab() registering tabController(${tabId}): `, tabController);
    if (this.tabRegistry[tabId]) { // NO LONGER: verify tabController is not already loaded!
      // ... we tightly control the tabId federated name-space,
      //     so any re-registration is presumably due to left-nav menu regeneration
      //     - THEREFORE we do not throw an exception here
      //     - IN ADDITION, we re-use the old registration (via the else clause below), BECAUSE:
      //       * the DispMode is NOT retained in the tab panel itself
      //         ... need more research: is this still relevant?
      //       * SHOULD BE OK: I can't imagine what could change that would impact the TabController
      // throw new Error(`***ERROR*** TabRegistry.registerTab() tabId: ${tabId} is already registered :-(`);
    }
    else {
      this.tabRegistry[tabId] = tabController;
    }
  }

  /**
   * Return the TabController registered to the supplied `tabId`
   * (undefined for NOT registered).
   *
   * @param {string} tabId - the id of the TabController to return.
   *
   * @returns {TabController} the TabController registered to the
   * supplied `tabId` (undefined for NOT registered).
   */
  getTabController(tabId) {
    // validate parameters
    const check = verify.prefix('TabRegistry.getTabController() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    // return the TabController (if any)
    return this.tabRegistry[tabId];
  }

}

// expose our single tabRegistry utility ... AI: singleton code smell
const tabRegistry = new TabRegistry();
export default tabRegistry;
