import {generateActions}    from 'action-u';
import _tabManager          from './featureName';

export default generateActions.root({
  [_tabManager]: { // prefix all actions with our feature name, guaranteeing they unique app-wide!

    activateTab: { // actions.activateTab(tabId, preview=true): Action
                   // > activate the specified tab (may exist, or will create on first reference)
                   actionMeta: { // NOTE: logic supplements this action to simplify reducer (see docs)
                     traits: ['tabId', 'preview'],
                     ratify: (tabId, preview=true) => [tabId, preview],
                   },
    },

    closeTab: { // actions.closeTab(tabId): Action
                // > close specified tab
                actionMeta: { // NOTE: logic supplements this action to simplify reducer (see docs)
                  traits: ['tabId'],
                },
    },

  },

});
