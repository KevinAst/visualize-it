import {generateActions}  from 'action-u';
import _changeManager     from './featureName';

export default generateActions.root({
  [_changeManager]: { // prefix all actions with our feature name, guaranteeing they unique app-wide!

    registerEPkg: { // actions.registerEPkg(ePkgId, crc, baseCrc): Action
                    // > registers the supplied ePkg to our state management
                    actionMeta: {
                      traits: ['ePkgId', 'crc', 'baseCrc'],
                    },
    },

    ePkgChanged:  { // actions.ePkgChanged(ePkgId, crc, baseCrc): Action
                    // > the supplied ePkg has changed
                    actionMeta: {
                      traits: ['ePkgId', 'crc', 'baseCrc'],
                    },
    },

  },

});
