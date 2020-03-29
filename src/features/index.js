import sandbox                from './sandbox/feature';
//import auth                   from './common/auth/feature';    // AI: DECIDE_AUTH_USER_NEEDED
//import authService            from './common/auth/subFeatures/authService/feature';
//import authServiceFirebase    from './common/auth/subFeatures/authServiceFirebase/feature';
//import authServiceMock        from './common/auth/subFeatures/authServiceMock/feature';
import initFirebase           from './common/initFirebase/feature';
import baseUI                 from './common/baseUI/feature';
import changeManager          from './common/changeManager/feature';
import tabManager             from './common/tabManager/feature';
import toolBar                from './toolBar/feature';
import logActions             from './common/diagnostic/logActions/feature';
import pwa                    from './common/pwa/feature';


//***
//*** Promote ALL features that make up our app
//***

export default [

  // app-specific features

  sandbox,

  // common app-neutral features

  baseUI,
  changeManager,
  tabManager,
  toolBar,
  
//auth,
//authService,
//authServiceFirebase,
//authServiceMock,
  
  initFirebase,
  
  pwa,

  // diagnostic features ...
  logActions,
];
