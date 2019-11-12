import {combineReducers}    from 'redux';
import {reducerHash}        from 'astx-redux-util';
import {expandWithFassets}  from 'feature-u';
import {slicedReducer}      from 'feature-redux';
import _tabManager          from './featureName';
import _tabManagerAct       from './actions';

// ***
// *** Our feature reducer, managing state for our tabManager process.
// ***

// ?? remove expandWithFassets ONCE DETERMINED NOT needed
const reducer = slicedReducer(_tabManager, expandWithFassets( (fassets) => combineReducers({

  // activeTabId: string ... the tabId of the active tab
  activeTabId: reducerHash({
    [_tabManagerAct.activateTab]:     (state, action) => action.tabControl.pgmDirectives.next_activeTabId,
    [_tabManagerAct.closeTab]:        (state, action) => action.next_activeTabId,
  }, null), // initialState

  // previewTabId: string ... the tabId of the optional tab that is in preview mode (will be re-used)
  previewTabId: reducerHash({
    [_tabManagerAct.activateTab]:     (previewTabId, action) => action.tabControl.pgmDirectives.next_previewTabId,
    [_tabManagerAct.closeTab]:        (previewTabId, action) => previewTabId===action.tabId ? null : previewTabId,
  }, null), // initialState

  // tabs: TabControl[] ... all of our tabs (TabControl objects), fed from the activateTab action
  tabs: reducerHash({
    [_tabManagerAct.activateTab]: (tabs, action) => {
      let   newTabs = tabs;
      const {removeTabId, addNewTab} = action.tabControl.pgmDirectives.tabsArrDirectives;

      if (removeTabId) {
        newTabs = newTabs.filter( (tab) => tab.tabId !== removeTabId );
      }
      if (addNewTab) {
        newTabs = [...newTabs, action.tabControl];
      }
      return newTabs;
    },

    [_tabManagerAct.closeTab]: (tabs, action) => tabs.filter( (tab) => tab.tabId !== action.tabId ),

  }, []), // initialState

}) ) );

export default reducer;


// ***
// *** Various Selectors
// ***

// Our feature state root (via slicedReducer as a single-source-of-truth)
const getFeatureState  = (appState) => reducer.getSlicedState(appState);
const gfs              = getFeatureState; // ... concise alias (used internally)

export const getActiveTabId  = (appState) => gfs(appState).activeTabId;
export const getPreviewTabId = (appState) => gfs(appState).previewTabId;
export const getTabs         = (appState) => gfs(appState).tabs;
export const getTotalTabs    = (appState) => gfs(appState).tabs.length;
