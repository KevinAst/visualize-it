import {createFeature}    from 'feature-u';
import _tabManager        from './featureName';
import _tabManagerAct     from './actions';
import reducer,
       {getTotalTabs,
        getActiveTabId}   from './state';
import logic              from './logic';
import route              from './route';


// feature: tabManager
//          a manager of tabs
export default createFeature({
  name: _tabManager,

  fassets: {
    define: {
      'actions.activateTab': _tabManagerAct.activateTab, // activateTab(tabId, preview=true): Action
      'actions.closeTab':    _tabManagerAct.closeTab,    // closeTab(tabId): Action

      'sel.getTotalTabs':    getTotalTabs,
      'sel.getActiveTabId':  getActiveTabId,
    },
  },

  reducer,
  logic,
  route,
});
