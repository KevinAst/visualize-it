// import ALL features that make up our app
import sandbox                from './sandbox/feature';
//import auth                   from './common/auth/feature';    // AI: DECIDE_AUTH_USER_NEEDED
//import authService            from './common/auth/subFeatures/authService/feature';
//import authServiceFirebase    from './common/auth/subFeatures/authServiceFirebase/feature';
//import authServiceMock        from './common/auth/subFeatures/authServiceMock/feature';
import initFirebase           from './common/initFirebase/feature';
import baseUI                 from './common/baseUI/feature';
import tabManagerFeature      from './common/tabManager/feature';
import logActions             from './common/diagnostic/logActions/feature';
import pwa                    from './common/pwa/feature';

// import feature public assets
import leftNavManager          from 'features/common/baseUI/LeftNavManager';
import LeftNavMenuPallet       from 'features/common/baseUI/comp/LeftNavMenuPallet';
import LeftNavCollapsibleItem  from 'features/common/baseUI/comp/LeftNavCollapsibleItem';
import tabManager              from 'features/common/tabManager/tabManager';
import TabControllerScene      from 'features/common/tabManager/TabControllerScene';
import TabControllerCollage    from 'features/common/tabManager/TabControllerCollage';
import TabControllerClass      from 'features/common/tabManager/TabControllerClass';


//***
//*** Promote ALL features that make up our app
//***

export default [

  // app-specific features

  sandbox,

  // common app-neutral features

  baseUI,
  tabManagerFeature,
  
//auth,
//authService,
//authServiceFirebase,
//authServiceMock,
  
  initFirebase,
  
  pwa,

  // diagnostic features ...
  logActions,
];


//*** 
//*** Promote feature public assets
//*** ... aliased to minimize feature coupling
//*** 

export {
  leftNavManager,
  LeftNavMenuPallet,
  LeftNavCollapsibleItem,

  tabManager,
  TabControllerScene,
  TabControllerCollage,
  TabControllerClass,
};
