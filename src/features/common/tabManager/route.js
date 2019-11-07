import React               from 'react';
import {featureRoute}      from 'feature-router';
import TabManager          from './comp/TabManager';

// ***
// *** The routes for this feature.
// ***

export default [

  featureRoute({
    content({fassets, appState}) {
      // TODO: eventually, when NO tabs, display our tab splash background page
      return <TabManager/>;
    }
  }),

];
