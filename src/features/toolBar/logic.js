import {createLogic}       from 'redux-logic';
import _toolBar            from './featureName';
import _toolBarAct         from './actions';
import {tabManager}        from 'features';


/**
 * Sync DispMode changes to the object model.
 */
export const syncDispModeChangesToObjectModel = createLogic({

  name: `${_toolBar}.syncDispModeChangesToObjectModel`,
  type: String(_toolBarAct.dispModeChanged),

  process({getState, action, fassets}, dispatch, done) {

    // propagate this change to the object model via the TabController
    const appState      = getState();
    const activeTabId   = fassets.sel.getActiveTabId(appState);
    const tabController = tabManager.getTabController(activeTabId);
    tabController.getTarget().setDispMode(action.dispMode);

    done();
  },

});


// promote all logic modules for this feature
// ... NOTE: individual logic modules are unit tested using the named exports.
export default [
  syncDispModeChangesToObjectModel,
];
