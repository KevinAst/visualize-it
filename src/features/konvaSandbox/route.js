import React               from 'react';
import {featureRoute, 
        PRIORITY}          from 'feature-router';
import KonvaSandboxScreen  from './KonvaSandboxScreen';

// ***
// *** The routes for this feature.
// ***

export default [

  featureRoute({
    //priority: PRIORITY.HIGH,
    content({fassets, appState}) {
      // TODO: for now simply unconditionally display our Sandbox screen
      return <KonvaSandboxScreen/>;
    }
  }),

];
