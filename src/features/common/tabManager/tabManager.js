import TabController from './TabController';
import verify        from 'util/verify';
import {isString}    from 'util/typeCheck';

/**
 * TabManager is the manager of ALL tabs (TabControllers).
 *
 * Registered tabs have the potential of being displayed.
 *
 * When a tab is initially referenced (a dynamic process),
 * it will be created through the TabController.xxx() API.
 * 
 * Once a tab has been displayed, all interaction to it will funnel
 * through the TabController API.
 */
class TabManager {

  /**
   * Create a TabManager.
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
   * @param {TabController} tabController the controller to register
   *
   * @throws {Error} an Error is thrown for invalid params or if the
   * controller has already been registered.
   */
  registerTab(tabController) {

    // validate parameters
    const check = verify.prefix('TabManager.registerTab() parameter violation: ');

    // ... tabController
    check(tabController,                          'tabController is required');
    check(tabController instanceof TabController, 'tabController must be a TabController instance');

    // maintain our tabRegistry catalog
    const tabId = tabController.getTabId();
    // console.log(`xx TabManager.registerTab() registering tabController(${tabId}): `, tabController);
    if (this.tabRegistry[tabId]) { // verify tabController is not already loaded
      throw new Error(`***ERROR*** TabManager.registerTab() tabId: ${tabId} is already registered :-(`);
    }
    this.tabRegistry[tabId] = tabController;
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
    const check = verify.prefix('TabManager.getTabController() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    // return the TabController (if any)
    return this.tabRegistry[tabId];
  }

}

// expose our single tabManager utility ... AI: singleton code smell
const tabManager = new TabManager();
export default tabManager;
