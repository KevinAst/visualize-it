import TabController    from './TabController';
import {writable, get}  from 'svelte/store';
import verify           from '../../verify';
import {isString,
        isBoolean}      from '../../typeCheck';
import {createLogger}   from '../../logger';
import checkUnknownArgs from '../../../util/checkUnknownArgs';

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
    this.tabs         = writable([]);   // reactive svelte store representing ALL visualized tabs: TabController[]
    this.activeTab    = writable(null); // reactive svelte store representing the current active tab: TabController (null for NO tabs)
    this.previewTab   = writable(null); // reactive svelte store representing the reusable preview tab (if any): TabController (null for none)
    this.tabRegistry  = {};             // self's tab registry catalog: ObjectMap[key:tabId, value: TabController]

    // bind our methods to self's object, allowing them to be used as isolated functions
    this.preregisterTab   = this.preregisterTab.bind(this);
    this.getRegisteredTab = this.getRegisteredTab.bind(this);
    this.activateTab      = this.activateTab.bind(this);
    this.closeTab         = this.closeTab.bind(this);
    this.closeOtherTabs   = this.closeOtherTabs.bind(this);
    this.closeTabsToRight = this.closeTabsToRight.bind(this);
    this.closeAllTabs     = this.closeAllTabs.bind(this);
    this.repositionTab    = this.repositionTab.bind(this);
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
   * A reactive svelte store representing ALL visualized tabs.
   * @type {TabController[]}
   */
//tabs; ... Svelte build cannot currently handle instance properties

  /**
   * A reactive svelte store representing the current active tab (null
   * for NO tabs).
   * @type {TabController}
   */
//activeTab; ... Svelte build cannot currently handle instance properties

  /**
   * A reactive svelte store representing the reusable preview tab (if
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
   * @throws {Error} an Error is thrown for invalid params (or
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
    if (this.tabRegistry[tabId]) { // verify tabController is not already loaded!
      throw new Error(`***ERROR*** TabManager.preregisterTab() tabId: ${tabId} is already registered :-(`);
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
      // make the tab permanent (when requested), if it was previously a preview tab
      if (_activeTab === _previewTab && !preview) {
        _previewTab = null;
      }
      logQualifier += ` ... activated EXISTING tab: ${_activeTab.getTabName()}`;
    }
    // when the requested tab is NOT currently under our control, setup a new tab
    else {
      // locate tab from our registry
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
    this.syncStore({
      onBehalfOf: `activateTab('${tabId}', preview:${preview})`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
      activeTab:   {before: $activeTab, after: _activeTab},
      previewTab:  {before: $previewTab, after: _previewTab},
    });
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

    // update store (when changed)
    this.syncStore({
      onBehalfOf:  `closeTab('${tabId}')`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
      activeTab:   {before: $activeTab, after: _activeTab},
      previewTab:  {before: $previewTab, after: _previewTab},
    });
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

    // update store (when changed)
    this.syncStore({
      onBehalfOf:  `closeOtherTabs('${tabId}')`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
      activeTab:   {before: $activeTab, after: _activeTab},
      previewTab:  {before: $previewTab, after: _previewTab},
    });
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

    // update store (when changed)
    this.syncStore({
      onBehalfOf:  `closeTabsToRight('${tabId}')`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
      activeTab:   {before: $activeTab, after: _activeTab},
      previewTab:  {before: $previewTab, after: _previewTab},
    });
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

    // update store (when changed)
    this.syncStore({
      onBehalfOf:  `closeAllTabs()`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
      activeTab:   {before: $activeTab, after: _activeTab},
      previewTab:  {before: $previewTab, after: _previewTab},
    });
  }

  /**
   * Reposition the supplied tab.
   *
   * @param {string} fromTabId - the id of the TabController to move.
   * @param {string} toTabId - the id of the TabController to reposition to.
   * @param {string} placement - a placement directive (before/after toTabId).
   */
  repositionTab(fromTabId, toTabId, placement) {
    // validate parameters
    const check = verify.prefix('TabManager.repositionTab() parameter violation: ');
    // ... fromTabId
    check(fromTabId,             'fromTabId is required');
    check(isString(fromTabId),   'fromTabId must be a string');
    // ... toTabId
    check(toTabId,               'toTabId is required');
    check(isString(toTabId),     'toTabId must be a string');
    // ... placement
    check(placement,             'placement is required');
    check(isString(placement),   'placement must be a string');
    check(placement==='before' ||
          placement==='after',   `placement must be either 'before' or 'after', NOT: '${placement}'`);

    let logQualifier = '';

    // get our current state
    // NOTE: get() is somewhat inefficient, BUT this is NOT a heavy usage
    const $tabs = get(this.tabs);
    let   _tabs = $tabs;

    // locate the tab objects of interest
    const fromTab = $tabs[findTabIndex(fromTabId, $tabs)];
    const toTab   = $tabs[findTabIndex(toTabId,   $tabs)];

    // no-op when to/from are the same (i.e. dropped on self)
    // ... don't worry about adjacent cases (where it results in a no-op)
    //       - no real harm done
    //       - would make routine needlessly complex
    if (fromTab === toTab) {
      logQualifier += ` ... no-op from/to are the same`;
    }
    else { // ... reposition the tab

      // remove `fromTab` out of it's current position
      // ... making a working copy of $tabs (i.e. future usage is _tabs NOT $tabs)
      _tabs = $tabs.filter( (tab) => tab !== fromTab );
      logQualifier += ` ... fromTab removed`;

      // reposition `fromTab` to it's new position (relative to `toTab` and `placement`)
      const toNodeIndx = _tabs.indexOf(toTab) + (placement === 'after' ? 1 : 0);
      _tabs.splice(toNodeIndx, 0, fromTab);
      logQualifier += ` ... fromTab repositioned`;
    }

    // update store (when changed)
    this.syncStore({
      onBehalfOf:  `repositionTab('${fromTabId}', '${toTabId}', '${placement}')`,
      logQualifier,
      tabs:        {before: $tabs,      after: _tabs},
    });
  }


  /**
   * Internal method to synchronize self's store when it has changed.
   *
   * A before/after image can be supplied for each store managed by
   * self.  Each corresponding store will be updated if a change is
   * detected.  If the store is NOT supplied, no change will be
   * analyzed (for that given store).
   * 
   * **Please Note** this method uses named parameters.
   *
   * @param {string} onBehalfOf - a human interpretable qualifier of
   * whose behalf we are working (used in logging) ... ex:
   * `activateTab('${tabId}', preview:${preview})`.
   *
   * @param {string} [logQualifier] - an optional human interpretable
   * qualifier used in logging ... ex:
   * ` ... introduced NEW tab: ${tabName} at end`
   * 
   * @param {{before, after}} [tabs] - the before/after image of the
   * tabs store (TabController[]) ... if NOT supplied no change will
   * be synced.
   *
   * @param {{before, after}} [activeTab] - the before/after image of the
   * activeTab store (TabController).
   *
   * @param {{before, after}} [previewTab] - the before/after image of the
   * previewTab store (TabController).
   *
   * @private
   */
  syncStore({onBehalfOf, logQualifier='', tabs, activeTab, previewTab, ...unknownArgs}={}) {
    // validate parameters
    const check = verify.prefix('TabManager.syncStore() parameter violation: ');
    // ... onBehalfOf
    check(onBehalfOf,             'onBehalfOf is required');
    check(isString(onBehalfOf),   'onBehalfOf must be a string');
    // ... logQualifier
    check(isString(logQualifier), 'logQualifier must be a string');
    // ... don't bother with remaining params (this is an internal method)
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // update each store (only when changed)
    const tabsChanged       = tabs       ? tabs.before       !== tabs.after       : false;
    const activeTabChanged  = activeTab  ? activeTab.before  !== activeTab.after  : false;
    const previewTabChanged = previewTab ? previewTab.before !== previewTab.after : false;
    if (tabsChanged) {
      this.tabs.set(tabs.after);
    }
    if (activeTabChanged) {
      this.activeTab.set(activeTab.after);
    }
    if (previewTabChanged) {
      this.previewTab.set(previewTab.after);
    }
    if ( !(tabsChanged || activeTabChanged || previewTabChanged)) {
      logQualifier += ` ... NOTHING CHANGED!!`;
    }

    // log what happened
    log(`${onBehalfOf} ... state changed: {tabs: ${tabsChanged}, activeTab: ${activeTabChanged}, previewTab: ${previewTabChanged}} ${logQualifier}`);
  }

}


// utility functions
const findTab      = (tabId, tabs) => tabs.find(      (tabController) => tabController.tabId===tabId );
const findTabIndex = (tabId, tabs) => tabs.findIndex( (tabController) => tabController.tabId===tabId );
