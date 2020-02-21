import {createLogic}        from 'redux-logic';
import _tabManager          from './featureName';
import _tabManagerAct       from './actions';
import * as sel             from './state';

import tabManager          from './tabManager';

/**
 * Supplement the 'activateTab' action with the following directives
 * (centralize logic and simplifying our reducers):
 *
 * ```
 * action: {
 *   ... from incoming action:
 *   tabId:   'xyz'
 *   preview: true
 * 
 *   ... supplemented by logic:
 *   tabName: 'ValveXyz'  ... strictly a convenience
 *   pgmDirectives: {     ... simplifies reducer
 *     next_activeTabId:  'xyz' (or null when NO tabs)
 *     next_previewTabId: 'xyz' (or null when NO preview tab)
 *     removeTabId:       'xyz' (or null) ... supports previewTab removal
 *     addNewTab:         true/false ... supports new tab creation (on first reference)
 *   }
 * }
 *```
 */
export const supplementActivateTab = createLogic({

  name: `${_tabManager}.supplementActivateTab`,
  type: String(_tabManagerAct.activateTab),

  transform({getState, action, fassets}, next, reject) {

    const appState = getState();

    //***
    //*** Request Aliases: req_ (from original action)
    //***

    const req_tabId   = action.tabId;
    const req_preview = action.preview; // true: preview tab (single-click), false: permanent tab (double-click)


    //***
    //*** Current State Aliases: cur_ (from redux state)
    //***

//  const cur_activeTabId  = sel.getActiveTabId(appState);
    const cur_previewTabId = sel.getPreviewTabId(appState);
    const cur_tabs         = sel.getTabs(appState);

    // the requested current tab entry (when it previously exists) ... undefined for new tab request
    const cur_targetTab = cur_tabs.find( (tab) => req_tabId === tab.tabId );
    
    // does the requested target tab pre-exist?
    const cur_targetTabPreExists = cur_targetTab ? true : false;

    //***
    //*** transform logic
    //***

    // reason about next_activeTabId
    // ... for 'activateTab' action, this is ALWAYS our incoming tabId
    const next_activeTabId = req_tabId;

    // manage addNewTab directive
    // ... action may direct the dynamic addition of a NEW tab FROM the tabCreator ReactComp found our Tab Registry
    const addNewTab = !cur_targetTabPreExists;

    // manage our preview tab directives
    // ... this is the only complex aspect of this process

    // ... default our directives to NO CHANGE
    let next_previewTabId = cur_previewTabId; // DEFAULT: NO change
    let removeTabId       = null;             // DEFAULT: null (i.e. NO preview tab to remove)

    // ... when activating a new tab
    if (addNewTab) {
      if (req_preview) { // ... our new tab is a "preview" mode request
        next_previewTabId = req_tabId;        // this new tab will now be the preview tab
        removeTabId       = cur_previewTabId; // displacing prior preview tab (if any - may be null)
      }
      else { // ... our new tab is a "permanent" mode request (any prior preview should NOT change)
        // ... this is our default setting
      }
    }
    // ... when activating an existing tab
    else {

      // KEY: THIS IS THE REAL TESTING POINT
      // if request is permanent, and this existing tab was previously preview
      // ... we want to remove the preview connotation
      if ( (!req_preview) && (req_tabId === cur_previewTabId) ) {
        next_previewTabId = null; // remove ANY preview connotation
      }
      // .. otherwise we leave preview as-is (I THINK)

    }

    //***
    //*** supplement our action with pgmDirectives (see JSDocs above)
    //***

    action.tabName = tabManager.getTabController(req_tabId).getTabName(); // ... AI: may error - returns undefined if NOT registered?

    action.pgmDirectives = {
      next_activeTabId,
      next_previewTabId,
      removeTabId,
      addNewTab,
    };

    next(action);
  },

});


/**
 * Supplement the 'closeTab' action with the following directives
 * (centralize logic and simplifying our reducers):
 *
 * ```
 * action: {
 *   ... from incoming action:
 *   tabId:   'xyz'
 * 
 *   ... supplemented by logic:
 *   pgmDirectives: {     ... simplifies reducer
 *     next_activeTabId:  'xyz' (or null when NO tabs)
 *   }
 * }
 *```
 */
export const supplementCloseTab = createLogic({

  name: `${_tabManager}.supplementCloseTab`,
  type: String(_tabManagerAct.closeTab),

  transform({getState, action, fassets}, next, reject) {

    const appState = getState();

    const tabs         = sel.getTabs(appState);
    const closeTabIndx = tabs.findIndex( (tab) => action.tabId === tab.tabId );

    // we shift our next active tab to the right (except on end - to the left)
    // ... REMEMBER: we are dealing with the state (array) BEFORE it has been altered

    //                                                     AT END ...       NOT AT END ...
    //                                                     ==============   ==============
    const nextTabIndx = (closeTabIndx === tabs.length-1) ? closeTabIndx-1 : closeTabIndx+1;
    const nextTabId   = nextTabIndx < 0 ? null : tabs[nextTabIndx].tabId;


    //***
    //*** supplement our action with pgmDirectives (see JSDocs above)
    //***

    action.pgmDirectives = {
      next_activeTabId: nextTabId,
    };

    next(action);
  },

});


// promote all logic modules for this feature
// ... NOTE: individual logic modules are unit tested using the named exports.
export default [

  supplementActivateTab,
  supplementCloseTab,

];
