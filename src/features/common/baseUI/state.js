import {expandWithFassets}    from 'feature-u';
import {combineReducers}      from 'redux';
import {reducerHash}          from 'astx-redux-util';
import {slicedReducer}        from 'feature-redux';
import _baseUI                from './featureName';
import _baseUIAct             from './actions';
import {fetchUITheme}         from './uiThemeStorage';
import {fetchResponsiveMode}  from './responsiveModeStorage';
import {createSelector}       from 'reselect';
import {fnRefEncode,
        fnRefDecode}          from 'util/reduxFnRef';


// ***
// *** Our feature reducer, managing our state.
// ***

const reducer = slicedReducer(_baseUI, expandWithFassets( (fassets) => combineReducers({

  // uiTheme: 'light'/'dark'
  uiTheme: reducerHash({
    [_baseUIAct.toggleUITheme]: (state, action) => state==='dark' ? 'light' : 'dark',
  }, fetchUITheme() ), // initialState (default to a persistent state)

  // responsiveMode: 'md'/'lg'/'off'
  responsiveMode: reducerHash({
    [_baseUIAct.setResponsiveMode]: (state, action) => action.responsiveMode,
  }, fetchResponsiveMode() || 'sm' ), // initialState (from device storage, default to small (a tablet))

  // loc: {lat, lng} ... device GPS location
  curView: reducerHash({
    [_baseUIAct.changeView]:   (state, action) => action.viewName,
    [fassets.actions.signOut]: (state, action) => 'eateries', // AI: Inappropriate app knowledge dependency (really part of an @@INIT app payload) ... AI: streamline in "INITIALIZATION" journal entry
  }, 'uninitialized'), // initialState

  // leftNavItems: {leftNavKey1: LeftNavComp1, leftNavKey2: LeftNavComp2, ...}
  leftNavItems: reducerHash({
    [_baseUIAct.addLeftNavItem]:    (state, action) => ({...state, ...{[action.leftNavKey]: fnRefEncode(action.LeftNavComp)}}),
    [_baseUIAct.removeLeftNavItem]: (state, action) => {
      const {[action.leftNavKey]: omit, ...remainder} = state;
      return remainder;
    },
  }, {}), // initialState

}) ) );

export default reducer;


// ***
// *** Various Selectors
// ***

/** Our feature state root (via slicedReducer as a single-source-of-truth) */
const getFeatureState           = (appState) => reducer.getSlicedState(appState);
const gfs = getFeatureState;      // ... concise alias (used internally)

                                  /** UI Theme: 'light'/'dark' */
export const getUITheme         = (appState) => gfs(appState).uiTheme || 'light'; // default to 'light' (on first occurrence -or- deviceStorage() NOT supported)

                                  /** Responsive Mode: 'md'/'lg'/'off' */
export const getResponsiveMode  = (appState) => gfs(appState).responsiveMode;

                                  /** current view (ex: 'eateries') */
export const curView            = (appState) => gfs(appState).curView;

                                       /** raw leftNavItems */
const getLeftNavItems = (appState)  => gfs(appState).leftNavItems;

                                       /** ordered leftNavItems */
export const getOrderedLeftNavItems  = createSelector( // return: [ [leftNavKey1, LeftNavItem1], [leftNavKey2, LeftNavItem2], ... ]
  getLeftNavItems,
  (leftNavItems) => {

    // convert to [ [leftNavKey1, encodedLeftNavItem1], [leftNavKey2, encodedLeftNavItem2], ... ]
    const encodedEntries = Object.entries( leftNavItems );

    // decode component functions [ [leftNavKey1, LeftNavItem1], [leftNavKey2, LeftNavItem2], ... ]
    const entries = encodedEntries.map( ([leftNavKey, encodedLeftNavComp]) => [leftNavKey, fnRefDecode(encodedLeftNavComp)]);

    // order by leftNavKey
    const orderedEntries = entries.sort( ([k1], [k2]) => k1.localeCompare(k2) );

    return orderedEntries;
  }
);
