import konvaSandbox                  from './konvaSandbox/feature';
import auth                          from './common/auth/feature';
import authService                   from './common/auth/subFeatures/authService/feature';
import authServiceFirebase           from './common/auth/subFeatures/authServiceFirebase/feature';
import authServiceMock               from './common/auth/subFeatures/authServiceMock/feature';
import initFirebase                  from './common/initFirebase/feature';
import baseUI                        from './common/baseUI/feature';
import tabManager                    from './common/tabManager/feature';
import logActions                    from './common/diagnostic/logActions/feature';
import pwa                           from './common/pwa/feature';

// accumulate/promote ALL features that make up our app
export default [


  //***
  //*** app-specific features
  //***

  konvaSandbox,

  //***
  //*** common app-neutral features
  //***

  baseUI,
  tabManager,
  
  auth,
  authService,
  authServiceFirebase,
  authServiceMock,
  
  initFirebase,
  
  pwa,

  // diagnostic features ...
  logActions,
];
