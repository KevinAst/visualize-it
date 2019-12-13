import React                    from 'react';
import Divider                  from '@material-ui/core/Divider';
import SampleMenuPallet         from './sampleSandbox/SampleMenuPallet';
import KonvaMenuPallet          from './konvaSandbox/KonvaMenuPallet';


// ***
// *** Initialize the sandbox feature, via the feature-u appInit() life-cycle-hook.
// ***

export default function initSandbox({showStatus, fassets, appState, dispatch}) {

  // register our SampleMenuPallet to the LeftNav
  dispatch( fassets.actions.addLeftNavItem('999-SandboxMenuPallet', () => (
    <>
      <SampleMenuPallet/>
      <Divider/>
      <KonvaMenuPallet/>
      <Divider/>
    </>
  )) );

}
