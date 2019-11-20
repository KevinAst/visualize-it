import React                    from 'react';
import Divider                  from '@material-ui/core/Divider';
import {LeftNavCollapsibleItem} from 'featureAssets';
import SampleMenuPallet         from './comp/SampleMenuPallet';
import KonvaMenuPallet          from './comp/KonvaMenuPallet';


// ***
// *** Initialize the sandbox feature, via the feature-u appInit() life-cycle-hook.
// ***

export default function initSandbox({showStatus, fassets, appState, dispatch}) {

  // register our SampleMenuPallet to the LeftNav
  dispatch( fassets.actions.addLeftNavItem('999-SampleMenuPallet', () => (
    <>
      <KonvaMenuPallet/>
      <Divider/>
      <LeftNavCollapsibleItem name="Sample Pallet">
        <SampleMenuPallet/>
      </LeftNavCollapsibleItem>
      <Divider/>
    </>
  )) );

}
