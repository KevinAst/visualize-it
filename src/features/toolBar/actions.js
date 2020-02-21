import {generateActions}    from 'action-u';
import _toolBar             from './featureName';

export default generateActions.root({
  [_toolBar]: { // prefix all actions with our feature name, guaranteeing they unique app-wide!

    syncAll: { // actions.syncAll(dispMode, isDispModeEditable): Action
               // > syncronize the toolBar with the paramaterized settings
               actionMeta: {
                 traits: ['dispMode', 'isDispModeEditable'],
               },
    },

    dispModeChanged: { // actions.dispModeChanged(dispMode): Action
                       // > the toolBar's dispMode has changed
                       actionMeta: {
                         traits: ['dispMode'],
                       },
    },

  },
});
