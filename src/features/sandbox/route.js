import React               from 'react';
import {featureRoute}      from 'feature-router';
import KonvaSandboxScreen  from './KonvaSandboxScreen';

// ***
// *** The routes for this feature.
// ***

export default [

  featureRoute({
    content({fassets, appState}) {
      // TODO: for now simply unconditionally display our Sandbox screen
      return <KonvaSandboxScreen/>;
    }
  }),

];
