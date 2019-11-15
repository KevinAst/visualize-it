import {createFeature}    from 'feature-u';
import _tabManager        from './featureName';
import _tabManagerAct     from './actions';
import reducer            from './state';
import logic              from './logic';
import route              from './route';


// feature: tabManager
//          a manager of tabs
export default createFeature({
  name: _tabManager,

  fassets: {
    define: {
      'actions.activateTab': _tabManagerAct.activateTab, // activateTab(tabControl): Action
      'actions.closeTab':    _tabManagerAct.closeTab,    // closeTab(tabId):         Action
    },
  },

  reducer,
  logic,
  route,
});
