import {combineReducers}  from 'redux';
import {reducerHash}      from 'astx-redux-util';
import {slicedReducer}    from 'feature-redux';
import _toolBar           from './featureName';
import _toolBarAct        from './actions';
import DispMode           from 'core/DispMode';

// ***
// *** Our feature reducer, managing state for our toolBar process.
// ***

const reducer = slicedReducer(_toolBar, combineReducers({

  // dispMode: string ... 'view'/'edit'/'animate' via DispMode enum
  dispMode: reducerHash({
    [_toolBarAct.syncAll]:         (state, action) => action.dispMode.enumKey,
    [_toolBarAct.dispModeChanged]: (state, action) => action.dispMode.enumKey,
  }, DispMode.view.enumKey), // initialState
  
  // isDispModeEditable: boolean
  isDispModeEditable: reducerHash({
    [_toolBarAct.syncAll]:  (state, action) => action.isDispModeEditable,
  }, true), // initialState

}) );

export default reducer;


// ***
// *** Various Selectors
// ***

// Our feature state root (via slicedReducer as a single-source-of-truth)
const getFeatureState  = (appState) => reducer.getSlicedState(appState);
const gfs              = getFeatureState; // ... concise alias (used internally)

export const getDispMode           = (appState) => DispMode.enumValueOf( gfs(appState).dispMode );
export const getIsDispModeEditable = (appState) => gfs(appState).isDispModeEditable;
