import LeftNavMenuPallet       from 'features/common/baseUI/comp/LeftNavMenuPallet';
import LeftNavCollapsibleItem  from 'features/common/baseUI/comp/LeftNavCollapsibleItem';

import {registerTab,
        getTabName,
        getTabCreator}         from 'features/common/tabManager/tabRegistry';



//*** 
//*** Promote various feature public assets (i.e. aliases)
//*** ... minimizing feature coupling.
//*** 

// NOTE: This named export supports ES6 imports.
//       Example:
//         import {whatever} from 'featureResources';
//       -or-
//         import * as featureResources from 'featureResources';
export {

  LeftNavMenuPallet,
  LeftNavCollapsibleItem,

  registerTab,
  getTabName,
  getTabCreator,

};

// NOTE: This default export supports CommonJS modules (otherwise Babel does NOT promote them).
//       Example:
//         const {whatever} = require('featureResources');
//       -or-
//         const featureResources = require('featureResources');
export default {

  LeftNavMenuPallet,
  LeftNavCollapsibleItem,

  registerTab,
  getTabName,
  getTabCreator,

};
