import TabController   from './TabController';
import {writable, get} from 'svelte/store';
import verify          from '../../verify';
import {isString, 
        isBoolean}     from '../../typeCheck';
import {createLogger}  from '../../logger';

// our internal diagnostic logger
const log = createLogger('***DIAG*** TabManager ... ').disable();

/**
 * TabManager is the primary class that manages a set of dynamic tabs
 * for a given context/visualization, and is the primary input to the
 * `<Tabs>` UI component.
 *
 * TabManager contains both state (Svelte stores) and API in support
 * of the interaction/visualization of a dynamic set of tabs.
 *
 * **Please See**: `index.js` for a usage summary.
 *
 * **Note**: The properties and API of this object are packaged in
 *           such a way as to allow them to be used in a functional way.
 *           In other words, the methods are bound to the object
 *           instance, allowing them to be used as isolated functions.
 */
export default class TabManager {

  /**
   * Create a TabManager, managing all the dynamic tabs of a given context.
   *
   * @param {string} ctxName - a human interpretable name for self's context.
   */
  constructor(ctxName) {

    // validate invocation/parameters
    const check = verify.prefix('TabManager() constructor violation: ');
    // ... new usage
    check(this instanceof TabManager, 'MUST be called with the new keyword');
    // ... ctxName
    check(ctxName,              'ctxName param is required');
    check(isString(ctxName),    'ctxName param must be a string');

    // carve out our object state
    this.ctxName      = ctxName;        // a human interpretable name for self's context
    this.tabs         = writable([]);   // reactive svlete store representing ALL visualized tabs: TabController[]
    this.activeTab    = writable(null); // reactive svlete store representing the current active tab: TabController (null for NO tabs)
    this.previewTab   = writable(null); // reactive svlete store representing the reusable preview tab (if any): TabController (null for none)
    this.tabRegistry  = {};             // self's tab registry catalog: ObjectMap[key:tabId, value: TabController]

    // bind our methods to self's object, allowing them to be used as isolated functions
    this.preregisterTab   = this.preregisterTab.bind(this);
    this.getRegisteredTab = this.getRegisteredTab.bind(this);
    this.activateTab      = this.activateTab.bind(this);
    this.closeTab         = this.closeTab.bind(this);
    this.closeOtherTabs   = this.closeOtherTabs.bind(this);
    this.closeTabsToRight = this.closeTabsToRight.bind(this);
    this.closeAllTabs     = this.closeAllTabs.bind(this);
  }

  /**
   * A human interpretable name for self's context.
   * @type {string}
   */
//ctxName; ... Svelte build cannot currently handle instance properties


  //****************************************************************************
  //*** Svelte Stores
  //****************************************************************************

  /**
   * A reactive svlete store representing ALL visualized tabs.
   * @type {TabController[]}
   */
//tabs; ... Svelte build cannot currently handle instance properties

  /**
   * A reactive svlete store representing the current active tab (null
   * for NO tabs).
   * @type {TabController}
   */
//activeTab; ... Svelte build cannot currently handle instance properties

  /**
   * A reactive svlete store representing the reusable preview tab (if
   * any) (null for none)
   * TODO: consider making private
   * @type {TabController}
   */
//previewTab; ... Svelte build cannot currently handle instance properties


  //****************************************************************************
  //*** tab registry related
  //****************************************************************************

  /**
   * Self's tab registry catalog.
   * @type {ObjectMap[key:tabId, value: TabController]}
   * @private
   */
//tabRegistry; ... Svelte build cannot currently handle instance properties

  /**
   * Preregister the supplied `tabController` as a potential tab that
   * can be rendered in our context.
   *
   * @param {TabController} tabController the controller to register.
   * NOTE: The tabController models both the tabId and tabName.
   *
   * @throws {Error} an Error is thrown for invalid params (NOT: or
   * when the controller has already been registered).
   */
  preregisterTab(tabController) {

    // validate parameters
    const check = verify.prefix('TabManager.preregisterTab() parameter violation: ');
    // ... tabController
    check(tabController,                          'tabController is required');
    check(tabController instanceof TabController, 'tabController must be a TabController instance');

    // maintain our tabRegistry catalog
    const tabId = tabController.getTabId();
    // console.log(`xx TabManager.preregisterTab() registering tabController(${tabId}): `, tabController);
    if (this.tabRegistry[tabId]) { // NO LONGER: verify tabController is not already loaded!
      // ... we tightly control the tabId federated name-space,
      //     so any re-registration is presumably due to left-nav menu regeneration
      //     - THEREFORE we do not throw an exception here
      //     - IN ADDITION, we re-use the old registration (via the else clause below), BECAUSE:
      //       * the DispMode is NOT retained in the tab panel itself
      //         ... need more research: is this still relevant?
      //       * SHOULD BE OK: I can't imagine what could change that would impact the TabController
      // throw new Error(`***ERROR*** TabManager.preregisterTab() tabId: ${tabId} is already registered :-(`);
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
  getRegisteredTab(tabId) {
    // validate parameters
    const check = verify.prefix('TabManager.getRegisteredTab() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    // return the TabController (if any)
    return this.tabRegistry[tabId];
  }


  //****************************************************************************
  //*** manage our dynamic tabs
  //****************************************************************************

  /**
   * Activate the supplied tabId (visualizing it's content).
   *
   * This can introduce a new dynamic tab (on first occurrence), or
   * simply activate an existing tab (when it has previously been
   * activated).
   *
   * @param {string} tabId - the id of the pre-registered TabController
   * to activate.
   * @param {boolean} [preview=true] - an indicator as to whether to
   * utilize a "preview" tab (which can be re-used by other "preview"
   * activations).
   */
  activateTab(tabId, preview=true) {
    // validate parameters
    const check = verify.prefix('TabManager.activateTab() parameter violation: ');
    // ... tabId
    check(tabId,              'tabId is required');
    check(isString(tabId),    'tabId must be a string');
    // ... preview
    check(isBoolean(preview), 'preview must be a boolean');

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs       = get(this.tabs);
    const $activeTab  = get(this.activeTab);
    const $previewTab = get(this.previewTab);

    // starting out our tabs are unchanged
    let _tabs       = $tabs;
    let _previewTab = $previewTab;

    // locate the requested  tab (if any), when it is already under our control
    let _activeTab = findTab(tabId, $tabs);

    // when the requested tab IS currently under our control
    if (_activeTab) {
      // make the tab perminate (when requested), if it was previously a preview tab
      if (_activeTab === _previewTab && !preview) {
        _previewTab = null;
      }
      logQualifier += ` ... activated EXISTING tab: ${_activeTab.getTabName()}`;
    }
    // when the requested tab is NOT currently under our control, setup a new tab
    else {
      // locate tab from our registery
      _activeTab = this.getRegisteredTab(tabId);
      check(_activeTab, `tabId ${tabId} has NOT been pre-registered, so we cannot activate it :-(`);

      // for preview tab requests, when a preview slot already exists, reuse that slot
      if (preview && _previewTab) {
        _tabs       = $tabs.map( (tab) => tab===_previewTab ? _activeTab : tab );
        _previewTab = _activeTab;
        logQualifier += ` ... introduced NEW tab: ${_activeTab.getTabName()} in existing preview slot`;
      }
      // otherwise carve out a new tab (at end)
      else {
        _tabs       = [...$tabs, _activeTab];
        _previewTab = preview ? _activeTab : _previewTab;
        logQualifier += ` ... introduced NEW tab: ${_activeTab.getTabName()} at end`;
      }
    }

    // update store (when changed)
    const tabsChanged       = $tabs       !== _tabs;
    const activeTabChanged  = $activeTab  !== _activeTab;
    const previewTabChanged = $previewTab !== _previewTab;
    if (tabsChanged) {
      this.tabs.set(_tabs);
    }
    if (activeTabChanged) {
      this.activeTab.set(_activeTab);
    }
    if (previewTabChanged) {
      this.previewTab.set(_previewTab);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }
    log(`activateTab('${tabId}', preview:${preview})` +
        ` ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}}` +
        logQualifier);
  }

  /**
   * Close the tab of the supplied tabId.
   *
   * @param {string} tabId - the id of the TabController to close.
   */
  closeTab(tabId) {
    // validate parameters
    const check = verify.prefix('TabManager.closeTab() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs       = get(this.tabs);
    const $activeTab  = get(this.activeTab);
    const $previewTab = get(this.previewTab);

    // locate the tab to close
    const closeTabIndex = findTabIndex(tabId, $tabs);
    if (closeTabIndex < 0) { // ... no-op if we can't find it
      log(`closeTab('${tabId}') ... tab NOT found ... NOTHING CHANGED!!`);
      return;
    }
    const closeTab = $tabs[closeTabIndex];

    // adjust activeTab (when it is being closed)
    let _activeTab = $activeTab;
    if (closeTab === $activeTab) {
      // shift the active tab to the right (except on end - to the left)
      // REMEMBER: we are dealing with the tabs array state BEFORE it has been altered
      //           ... we alter the tabs array in the next step (i.e. close our tab)

      //                                                  AT END ...        NOT AT END ...
      //                                                  ===============   ===============
      const nextIndx = (closeTabIndex===$tabs.length-1) ? closeTabIndex-1 : closeTabIndex+1;
      _activeTab = nextIndx < 0 ? null : $tabs[nextIndx];
      logQualifier += ` ... activeTab adjusted`;
    }

    // clear previewTab (when it is being closed)
    let _previewTab = $previewTab;
    if (closeTab === $previewTab) {
      _previewTab = null;
      logQualifier += ` ... previewTab cleared`;
    }

    // purge the requested tab
    const _tabs = $tabs.filter( (tab) => tab !== closeTab );
    logQualifier += ` ... tab purged`;

    // update store
    const tabsChanged       = $tabs       !== _tabs;
    const activeTabChanged  = $activeTab  !== _activeTab;
    const previewTabChanged = $previewTab !== _previewTab;
    if (tabsChanged) {
      this.tabs.set(_tabs);
    }
    if (activeTabChanged) {
      this.activeTab.set(_activeTab);
    }
    if (previewTabChanged) {
      this.previewTab.set(_previewTab);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }
    log(`closeTab('${tabId}')` +
        ` ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}}` +
        logQualifier);
  }

  /**
   * Close all tabs except the supplied tabId.
   *
   * @param {string} tabId - the id of the Tab to remain open.
   */
  closeOtherTabs(tabId) {
    // validate parameters
    const check = verify.prefix('TabManager.closeOtherTabs() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs       = get(this.tabs);
    const $activeTab  = get(this.activeTab);
    const $previewTab = get(this.previewTab);

    // locate the tab to retain
    const retainTabIndex = findTabIndex(tabId, $tabs);
    if (retainTabIndex < 0) { // ... no-op if we can't find it
      log(`closeOtherTabs('${tabId}') ... tab NOT found ... NO-OP ... NOTHING CHANGED!!`);
      return;
    }
    const retainTab = $tabs[retainTabIndex];

    // adjust activeTab (when was not currently active - it is the only one left)
    let _activeTab = $activeTab;
    if (retainTab !== _activeTab) {
      _activeTab   = retainTab;
      logQualifier += ` ... activeTab adjusted`;
    }

    // clear previewTab (when it is being closed)
    let _previewTab = $previewTab;
    if (_previewTab && retainTab !== _previewTab) {
      _previewTab = null;
      logQualifier += ` ... previewTab cleared`;
    }

    // purge the requested tabs
    let _tabs = $tabs;
    if ($tabs.length > 1) {
      _tabs = $tabs.filter( (tab) => tab === retainTab );
      logQualifier += ` ... other tabs purged`;
    }

    // update store
    const tabsChanged       = $tabs       !== _tabs;
    const activeTabChanged  = $activeTab  !== _activeTab;
    const previewTabChanged = $previewTab !== _previewTab;
    if (tabsChanged) {
      this.tabs.set(_tabs);
    }
    if (activeTabChanged) {
      this.activeTab.set(_activeTab);
    }
    if (previewTabChanged) {
      this.previewTab.set(_previewTab);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }
    log(`closeOtherTabs('${tabId}')` +
        ` ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}}` +
        logQualifier);
  }

  /**
   * Close all tabs to the right of the supplied tabId.
   *
   * @param {string} tabId - the id of the anchor Tab (remaining open and to
   * the left).
   */
  closeTabsToRight(tabId) {
    // validate parameters
    const check = verify.prefix('TabManager.closeTabsToRight() parameter violation: ');
    // ... tabId
    check(tabId,             'tabId is required');
    check(isString(tabId),   'tabId must be a string');

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs       = get(this.tabs);
    const $activeTab  = get(this.activeTab);
    const $previewTab = get(this.previewTab);

    // locate the anchorTab (remaining open and to the left)
    const anchorTabIndex = findTabIndex(tabId, $tabs);
    if (anchorTabIndex < 0) { // ... no-op if we can't find it
      log(`closeTabsToRight('${tabId}') ... tab NOT found ... NO-OP ... NOTHING CHANGED!!`);
      return;
    }
    const anchorTab = $tabs[anchorTabIndex];

    // purge the requested tabs
    let _tabs = $tabs;
    if ($tabs.length > anchorTabIndex+1) {
      _tabs = $tabs.filter( (tab, indx) => indx <= anchorTabIndex );
      logQualifier += ` ... tabs to the right purged`;
    }

    // adjust activeTab (when the prior active has been closed)
    let _activeTab = $activeTab;
    if (!findTab(_activeTab.getTabId(), _tabs)) {
      _activeTab   = anchorTab;
      logQualifier += ` ... activeTab adjusted`;
    }

    // clear previewTab (when it has been closed)
    let _previewTab = $previewTab;
    if (_previewTab && !findTab(_previewTab.getTabId(), _tabs)) {
      _previewTab = null;
      logQualifier += ` ... previewTab cleared`;
    }

    // update store
    const tabsChanged       = $tabs       !== _tabs;
    const activeTabChanged  = $activeTab  !== _activeTab;
    const previewTabChanged = $previewTab !== _previewTab;
    if (tabsChanged) {
      this.tabs.set(_tabs);
    }
    if (activeTabChanged) {
      this.activeTab.set(_activeTab);
    }
    if (previewTabChanged) {
      this.previewTab.set(_previewTab);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }
    log(`closeTabsToRight('${tabId}')` +
        ` ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}}` +
        logQualifier);
  }

  /**
   * Close all tabs.
   */
  closeAllTabs() {

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs       = get(this.tabs);
    const $activeTab  = get(this.activeTab);
    const $previewTab = get(this.previewTab);

    // close all tabs
    let _tabs = $tabs;
    if ($tabs.length > 0) {
      _tabs = [];
      logQualifier += ` ... all tabs closed`;
    }

    // adjust activeTab (when it has been closed)
    let _activeTab = $activeTab;
    if (_activeTab) {
      _activeTab   = null;
      logQualifier += ` ... activeTab cleared`;
    }

    // clear previewTab (when it has been closed)
    let _previewTab = $previewTab;
    if (_previewTab) {
      _previewTab = null;
      logQualifier += ` ... previewTab cleared`;
    }

    // update store
    const tabsChanged       = $tabs       !== _tabs;
    const activeTabChanged  = $activeTab  !== _activeTab;
    const previewTabChanged = $previewTab !== _previewTab;
    if (tabsChanged) {
      this.tabs.set(_tabs);
    }
    if (activeTabChanged) {
      this.activeTab.set(_activeTab);
    }
    if (previewTabChanged) {
      this.previewTab.set(_previewTab);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }
    log(`closeAllTabs()` +
        ` ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}}` +
        logQualifier);
  }

}


// utility functions
const findTab      = (tabId, tabs) => tabs.find(      (tabController) => tabController.tabId===tabId );
const findTabIndex = (tabId, tabs) => tabs.findIndex( (tabController) => tabController.tabId===tabId );
