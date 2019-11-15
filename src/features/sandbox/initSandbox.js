import React            from 'react';
import Divider          from '@material-ui/core/Divider';
import {MenuPallet}     from 'featureAssets';
import SampleMenuPallet from './comp/SampleMenuPallet';

// ***
// *** Initialize the sandbox feature, via the feature-u appInit() life-cycle-hook.
// ***

export default function initSandbox({showStatus, fassets, appState, dispatch}) {

  // register our SampleMenuPallet to the LeftNav
  dispatch( fassets.actions.addLeftNavItem('999-SampleMenuPallet', () => (
    <>
      <MenuPallet name="SampleMenuPallet">
        <SampleMenuPallet/>
      </MenuPallet>
      <Divider/>
    </>
  )) );

}
