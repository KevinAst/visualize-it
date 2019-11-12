import {generateActions}    from 'action-u';
import _tabManager          from './featureName';

export default generateActions.root({
  [_tabManager]: { // prefix all actions with our feature name, guaranteeing they unique app-wide!

    activateTab: { // actions.activateTab(tabControl): Action
                   // > activate the specified tab (may exist, or will create)
                   actionMeta: { // NOTE: logic supplements the tabControl with pgmDirectives ?? should supplement action
                     traits: ['tabControl'],
                   },
    },

    closeTab: { // actions.closeTab(tabId): Action
                // > close specified tab
                actionMeta: { // NOTE: logic supplements the action with: next_activeTabId
                  traits: ['tabId'],
                },
    },

  },

});
