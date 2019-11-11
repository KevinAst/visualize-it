import {generateActions}    from 'action-u';
import _tabManager          from './featureName';

export default generateActions.root({
  [_tabManager]: { // prefix all actions with our feature name, guaranteeing they unique app-wide!

    closeTab: { // actions.closeTab(tabId): Action
                // > close specified tab
                actionMeta: {
                  traits: ['tabId'],
                },
    },

    activateTab: { // actions.activateTab(tabControl): Action
                   // > activate the specified tab (may exist, or will create)
                   actionMeta: { // NOTE: logic supplements the tabControl with ????? enumerate
                     traits: ['tabControl'],
                   },
    },

  },

});
