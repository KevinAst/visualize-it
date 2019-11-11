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
    [_tabManagerAct.closeTab]:        (state, action) => null, // ?? must set to OTHER tabId ?? maintain other heuristics too
    [_tabManagerAct.activateTab]:     (tabs, action)  => action.tabControl.pgmDirectives.next_activeTabId,
//?? OLD: OBSOLETE
//  [_tabManagerAct.activateTab]:     (tabs, action)  => action.tabControl.tabId, // ?? maintain other heuristics too
  }, null), // initialState

  // previewTabId: string ... the tabId of the optional tab that is in preview mode (will be re-used)
  previewTabId: reducerHash({
    // ?? TEST THIS when our visuals support preview
    [_tabManagerAct.activateTab]:     (tabs, action)  => action.tabControl.pgmDirectives.next_previewTabId,
  }, null), // initialState

  // tabs: [TabControl] ... an array of all our tabs (TabControl objects - fed from our actions)
  //        {
  //          tabId:   'tabXYZ',        ... repeated in self for convenience NOTE: this is a unique ID defined by client
  //          tabName: 'ACME Pressure'  ... concise desc displayed in tab
  // 
  //   ??     dedicated: true/false,    ... directive as to whether the tab is dedicated (permanent via double-click) or preview (single-click) (?? NO (I think): when tab is being created the first time)
  // 
  //                                    >>> FOLLOWING CONTENT is supplied by centralized logic, simplifying the reducer process
  //          xxx: xxx ???
  // 
  //                                    >>> FOLLOWING DATA IS RETAINED in our state BECAUSE it is USED by JSX to dynamically create the tab content
  //          contentCreator: {
  //            contentType: 'system_view',   ... an index into the "contentCreator" global control structure that knows HOW to create the content of the tab
  //            contentContext: {             ... an open structure that parameterizes the content creation (as needed by contentType)
  //              whatever: 1,
  //            }
  //          }
  //        }
  tabs: reducerHash({
    [_tabManagerAct.activateTab]: (tabs, action) => {

      let   newTabs    = tabs;

      const {removeTabId, addNewTab} = action.tabControl.pgmDirectives.tabsArrDirectives;

      if (removeTabId) {
        newTabs = newTabs.filter( (tab) => tab.tabId !== removeTabId );
      }

      if (addNewTab) {
        newTabs = [...newTabs, action.tabControl];
      }

      // console.log(`?? tabs changed: ${newTabs !== tabs}`);

      return newTabs;

      // ?? OLD: OBSOLETE
      //? const existingTab = tabs.find( (tab) => action.tabControl.tabId === tab.tabId );
      //? if (existingTab) {
      //?   return tabs; // NO change
      //? }
      //? else {
      //?   return [...tabs, action.tabControl];
      //? }
    },
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
