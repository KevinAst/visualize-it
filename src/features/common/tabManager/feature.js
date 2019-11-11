import {createFeature}    from 'feature-u';
import _tabManager        from './featureName';
import reducer            from './state';
import logic              from './logic';
import route              from './route';

// feature: tabManager
//          a manager of tabs
export default createFeature({
  name: _tabManager,

  reducer,
  logic,
  route,

});
