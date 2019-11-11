import {createLogic}        from 'redux-logic';
import _tabManager          from './featureName';
import _tabManagerAct       from './actions';
import * as sel             from './state';

/**
 * Supplement our 'activateTab' action with additional
 * `pgmDirectives`, in support of preview/dedicated tabs.  A preview
 * tab (activated with a single-click) is a temporary tab that will be
 * re-used, where a dedicated tab is permanent.
 * 
 * By supplementing this action, we centralize the logic in one spot, and
 * greatly simplify our reducer process.
 */
export const supplementActivateTab = createLogic({

  name: `${_tabManager}.supplementActivateTab`,
  type: String(_tabManagerAct.activateTab),

  transform({getState, action, fassets}, next, reject) {

    const appState = getState();

    //***
    //*** Request Aliases: req_ (from action.tabControl)
    //***

    const req_tabId     = action.tabControl.tabId;
    const req_dedicated = action.tabControl.dedicated; // is target tab dedicated (permanent via double-click) or preview (single-click)


    //***
    //*** Current State Aliases: cur_ (from redux state)
    //***

//  const cur_activeTabId  = sel.getActiveTabId(appState);
    const cur_previewTabId = sel.getPreviewTabId(appState);
    const cur_tabs         = sel.getTabs(appState);


    // the current requested tab <TabControl> (when it previously exists) ... undefined for new tab request
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
    // ... action may direct the dynamic adding of a NEW tab FROM the requested action content
    const addNewTab = !cur_targetTabPreExists;

    // manage preview tab
    // ... this is the only complex aspect of this process

    // default our directives to NO CHANGE
    let next_previewTabId = cur_previewTabId; // DEFAULT: NO change
    let removeTabId       = null;             // DEFAULT: null (i.e. NO preview tab to remove)

    if (addNewTab) { // ... adding new tab
      if (req_dedicated) { // ... new tab is dedicated (any prior preview should NOT change)
        // ... this is our default setting
      }
      else { // ... new tab is preview (displacing any prior preview)
        next_previewTabId = req_tabId;        // our new tab will now be the preview tab
        removeTabId       = cur_previewTabId; // displacing prior preview tab (if any - may be null)
      }
    }
    else { // ... activating an existing tab

      // KEY: THIS IS THE REAL TESTING POINT
      // if request is dedicated, and this existing tab was previously preview
      // ... we want to remove the preview connotation
      if (req_dedicated && req_tabId === cur_previewTabId) {
        next_previewTabId = null; // remove ANY preview connotation
      }
      // .. otherwise we leave preview as-is (I THINK)

      // FIRST LOGIC (I THINK THIS IS BAD)
      // ?? OBSOLETE THIS (after a bit of testing)
      //? // define the ultimate dedicated/preview state of the targeted tab
      //? // ... ex: a preview may be requested, but it may already be in a dedicated state (taking precedence)
      //? const existingTargetTab_dedicated = req_tabId !== cur_previewTabId; // OBSCURE: have to consider req_dedicated
      //? 
      //? if (existingTargetTab_dedicated) { // ... existing target tab is dedicated (any prior preview should NOT change)
      //?   // ... this is our default setting
      //? }
      //? else { // ... existing target tab is preview (displacing any prior preview)
      //?   // OBSCURE: THINK ABOUT THIS: for existing tab to be preview, IT MUST ALREADY BE PREVIEW
      //?   next_previewTabId = req_tabId; // our new tab will now be the preview tab
      //?   removeTabId       = cur_previewTabId; // displacing prior preview tab (if any - may be null)
      //? }
    }

    //***
    //*** supplement our action with pgmDirectives
    //***

    // SUMMARY:
    // pgmDirectives: {
    //   next_activeTabId:  'tabXYZ' -or- null (when NO tabs) ... for 'activateTab' action, this is ALWAYS our incoming tabId
    //   next_previewTabId: 'tabXYZ' -or- null (when NO preview tab)
    //   tabsArrDirectives: {
    //     removeTabId: 'tabXYZ' -or- null ... supporting previewTab removal
    //        REDUCER EX: newTabs = tabs.filter( (tab) => tab.tabControl.activeTabId !== tabControl.tabId );
    //     addNewTab:   true/false
    //        REDUCER EX: newTabs = [...tabs, action.tabControl]
    //   }
    // }
    action.tabControl.pgmDirectives = {
      next_activeTabId,
      next_previewTabId,
      tabsArrDirectives: {
        removeTabId,
        addNewTab,
      },
    };

    next(action);
  },

});

// promote all logic modules for this feature
// ... NOTE: individual logic modules are unit tested using the named exports.
export default [

  supplementActivateTab,

];
