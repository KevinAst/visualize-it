import {combineReducers}    from 'redux';
import {reducerHash}        from 'astx-redux-util';
import {slicedReducer}      from 'feature-redux';
import _changeManager       from './featureName';
import _changeManagerAct    from './actions';


// ***
// *** Our feature reducer, managing state for our changeManager process.
// ***

const reducer = slicedReducer(_changeManager, combineReducers({

  // ePkgs: {      // indexed ePkg entries
  //   [ePkgId]: { // ex: 'com.astx.KONVA' for pkg (SmartPkg) or 'com.astx.KONVA/scene1' for pkgEntry
  //     crc:     123,
  //     baseCrc: 456
  //   },
  //   ...
  // }
  ePkgs: reducerHash({
    [_changeManagerAct.registerEPkg]: updateCrcs,
    [_changeManagerAct.ePkgChanged]:  updateCrcs,
  }, {}), // initialState

  
  // undoRedo: {       // indexed PkgEntries
  //   [pkgEntryId]: { // ex: 'com.astx.KONVA/scene1'
  //     undoAvail: true,
  //     redoAvail: false
  //   },
  //   ...
  // }
  undoRedo: reducerHash({
    [_changeManagerAct.undoRedoChanged]: (state, action) => ({...state, ...{ [action.pkgEntryId]:{undoAvail: action.undoAvail, redoAvail: action.redoAvail} } }),
  }, {}), // initialState



}) );

export default reducer;

function updateCrcs(state, action) {
  const ePkgs = state;
  const {ePkgId, crc, baseCrc} = action;
  return {...ePkgs, ...{
    [ePkgId]: {crc, baseCrc}
  }};
}

// ***
// *** Various Selectors
// ***

// Our feature state root (via slicedReducer as a single-source-of-truth)
const getFeatureState  = (appState) => reducer.getSlicedState(appState);
const gfs              = getFeatureState; // ... concise alias (used internally)

// getEPkgState(appState, ePkgId): ePkgState (undefined if bad ePkgId param ... ?? undefined is needed till we get class entries fully resolved
export const getEPkgState = (appState, ePkgId) => gfs(appState).ePkgs[ePkgId];

// isEPkgInSync(appState, ePkgId): boolean
export const isEPkgInSync = (appState, ePkgId) => {
  const ePkgState = getEPkgState(appState, ePkgId);
  //console.log(`xx sel.isEPkgInSync ePkgId: ${ePkgId} ... `, {ePkgState});
  return ePkgState ? (ePkgState.crc === ePkgState.baseCrc) : true;  // if we couldn't find it call it in-sync ... ?? needed till we get class entries fully resolved
}

// getUndoRedo(appState, pkgEntryId): UndoRedo - {undoAvail: boolean, redoAvail: boolean} ?? undefined if bad ePkgId param ... ?? undefined is needed till we get class entries fully resolved
export const getUndoRedo = (appState, pkgEntryId) => {
  const undoRedo = gfs(appState).undoRedo[pkgEntryId];
  return undoRedo || {undoAvail: false, redoAvail: false}; // default to false/false
}

export const isUndoAvail = (appState, pkgEntryId) => getUndoRedo(appState, pkgEntryId).undoAvail; // isUndoAvail(appState, pkgEntryId): boolean
export const isRedoAvail = (appState, pkgEntryId) => getUndoRedo(appState, pkgEntryId).redoAvail; // isRedoAvail(appState, pkgEntryId): boolean
