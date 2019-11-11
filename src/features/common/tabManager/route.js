import React           from 'react';
import {featureRoute}  from 'feature-router';
import TabManager      from './comp/TabManager';
import StartUpPage     from './comp/StartUpPage';
import {getTotalTabs}  from './state';

// ***
// *** The routes for this feature.
// ***

export default [

  featureRoute({
    content: ({fassets, appState}) => getTotalTabs(appState) === 0 ? <StartUpPage/> : <TabManager/>,
  }),

];
