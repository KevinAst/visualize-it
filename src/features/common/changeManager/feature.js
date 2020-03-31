import {createFeature}    from 'feature-u';
import _changeManager     from './featureName';
import reducer,
       {isEPkgInSync,
        isUndoAvail,
        isRedoAvail}      from './state';
import changeManager      from './changeManager';


// feature: changeManager
//          a manager of change (retaining critical crcs in state)
export default createFeature({
  name: _changeManager,

  fassets: {
    define: {
      'sel.isEPkgInSync':  isEPkgInSync,  // isEPkgInSync(appState, ePkgId): boolean
      'sel.isUndoAvail':   isUndoAvail,   // isUndoAvail(appState, pkgEntryId): boolean
      'sel.isRedoAvail':   isRedoAvail,   // isRedoAvail(appState, pkgEntryId): boolean
    },
  },

  reducer,

  // inject operational dependencies into changeManager
  appInit({showStatus, fassets, getState, dispatch}) {
    changeManager.injectDependency(dispatch);
  },

});
