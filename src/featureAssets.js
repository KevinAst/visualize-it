import LeftNavCollapsibleItem  from 'features/common/baseUI/comp/LeftNavCollapsibleItem';

//*** 
//*** Promote various feature public assets (i.e. aliases)
//*** ... minimizing feature coupling.
//*** 

// NOTE: This named export supports ES6 imports.
//       Example:
//         import {whatever} from 'featureAssets';
//       -or-
//         import * as featureAssets from 'featureAssets';
export {
  LeftNavCollapsibleItem,
};

// NOTE: This default export supports CommonJS modules (otherwise Babel does NOT promote them).
//       Example:
//         const {whatever} = require('featureAssets');
//       -or-
//         const featureAssets = require('featureAssets');
export default {
  LeftNavCollapsibleItem,
};
