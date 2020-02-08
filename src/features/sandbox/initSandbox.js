import React                    from 'react';
//import Divider                  from '@material-ui/core/Divider';
//import SampleMenuPallet         from './sampleSandbox/SampleMenuPallet';
//import KonvaMenuPallet          from './konvaSandbox/KonvaMenuPallet';

import {LeftNavMenuPallet}      from 'features';

import konvaSandboxSmartPkg     from './konvaSandbox/konvaSandboxSmartPkg';

// ***
// *** Initialize the sandbox feature, via the feature-u appInit() life-cycle-hook.
// ***

export default function initSandbox({showStatus, fassets, getState, dispatch}) {

  // register our SampleMenuPallet to the LeftNav
  // ?? OLD: PURGE (once we obsolete referenced code)
  //? dispatch( fassets.actions.addLeftNavItem('999-SandboxMenuPallet', () => (
  //?   <>
  //?     <SampleMenuPallet/>
  //?     <Divider/>
  //?     <KonvaMenuPallet/>
  //?     <Divider/>
  //?   </>
  //? )) );
  // ?? NEW:
  dispatch( fassets.actions.addLeftNavItem('999-SandboxMenuPallet', () => (
    <LeftNavMenuPallet smartPkg={konvaSandboxSmartPkg}/>
  )) );

}
