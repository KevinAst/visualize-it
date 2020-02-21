import {createLogic}       from 'redux-logic';
import {expandWithFassets} from 'feature-u';
import _toolBar            from './featureName';
import _toolBarAct         from './actions';
import {tabManager}        from 'features';

/**
 * Sync toolBar settings, when active tab changes (via interation with TabController).
 */
export const monitorActiveTab = expandWithFassets( (fassets) => createLogic({

  name: `${_toolBar}.monitorActiveTab`,
  type: String(fassets.actions.activateTab),

  process({getState, action, fassets}, dispatch, done) {

    // sync toolBar settings by interacting with the new "active" TabController
    const tabController      = tabManager.getTabController(action.tabId);
    const dispMode           = tabController.getDispMode();
    const isDispModeEditable = tabController.isEditable();

    dispatch( _toolBarAct.syncAll(dispMode, isDispModeEditable) );

    done();
  },

}) );


/**
 * Sync DispMode changes to the object model.
 */
export const syncDispModeChanges = createLogic({

  name: `${_toolBar}.syncDispModeChanges`,
  type: String(_toolBarAct.dispModeChanged),

  process({getState, action, fassets}, dispatch, done) {

    // propogate this change to the object model via the TabController
    const appState      = getState();
    const activeTabId   = fassets.sel.getActiveTabId(appState);
    const tabController = tabManager.getTabController(activeTabId);
    tabController.setDispMode(action.dispMode);

    done();
  },

});


// promote all logic modules for this feature
// ... NOTE: individual logic modules are unit tested using the named exports.
export default expandWithFassets( (fassets) => [
  monitorActiveTab(fassets),
  syncDispModeChanges,
] );
