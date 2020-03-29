import {combineReducers}    from 'redux';
import {reducerHash}        from 'astx-redux-util';
import {expandWithFassets}  from 'feature-u';
import {slicedReducer}      from 'feature-redux';
import _toolBar             from './featureName';
import _toolBarAct          from './actions';
import DispMode             from 'core/DispMode';
import {tabRegistry}        from 'features/xtra';

// ***
// *** Our feature reducer, managing state for our toolBar process.
// ***

const reducer = slicedReducer(_toolBar, expandWithFassets( (fassets) => combineReducers({

  // dispMode: string ... 'view'/'edit'/'animate' via DispMode enum
  dispMode: reducerHash({
    [fassets.actions.activateTab]: (state, action) => tabRegistry.getTabController(action.tabId).getTarget().getDispMode().enumKey,
    [_toolBarAct.dispModeChanged]: (state, action) => action.dispMode.enumKey,
  }, DispMode.view.enumKey), // initialState

}) ) );

export default reducer;


// ***
// *** Various Selectors
// ***

// Our feature state root (via slicedReducer as a single-source-of-truth)
const getFeatureState  = (appState) => reducer.getSlicedState(appState);
const gfs              = getFeatureState; // ... concise alias (used internally)

export const getDispMode = (appState) => DispMode.enumValueOf( gfs(appState).dispMode );
