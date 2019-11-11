import React,
       {useCallback}   from 'react';

import {useSelector,
        useDispatch}   from 'react-redux'

import * as _tabManagerSel from '../state';
import _tabManagerAct      from '../actions';

import {makeStyles}    from '@material-ui/core/styles';

import AppBar          from '@material-ui/core/AppBar';
import Tabs            from '@material-ui/core/Tabs';
import Tab             from '@material-ui/core/Tab';
import Paper           from '@material-ui/core/Paper';
import Box             from '@material-ui/core/Box';

/**
 * TabManager: Our top-level manager of tabs.
 */
export default function TabManager() {

  const classes = useStyles();

  const activeTabId  = useSelector((appState) => _tabManagerSel.getActiveTabId(appState), []);
  const previewTabId = useSelector((appState) => _tabManagerSel.getPreviewTabId(appState), []);
  const tabs         = useSelector((appState) => _tabManagerSel.getTabs(appState), []);
  const dispatch     = useDispatch();
  const tabChanged   = useCallback((event, newActiveTabId) => {
    // console.log(`?? tabChanged('${newActiveTabId}')`);
    dispatch( _tabManagerAct.activateTab({ // simulated TabControl
      tabId: newActiveTabId,               // ... for existing tabs, only this attribute is used
    }) );
  }, [dispatch]); // ?? dependency UNSURE


  // KJB NOTE: our TabPanels ... content is app-specific ... derived from tabControl

  // KJB NOTE: these props are ONLY used to determine visibility

  // ?? KEY NOTE: our content is dynamically created using a global contentCreator
  //
  // we are iterating over state:
  //   tabManager.tabs ... an array of TabControl
  //
  // for each: tabControl
  //   const contentCreatorCtx = tabControl.contentCreator;
  //   return:
  //     contentCreator[contentCreatorCtx.contentType].createContent(contentCreatorCtx.contentContext);
  //
  // ?? HOPEFULLY this will NOT "Comp.manifest" multiple times
  return (
    <>
      <AppBar position="static" color="default">
        {/* KJB NOTE: <Tabs> value IS the currently selected Tab value ... can be false (no tab selected - all that useful) */}
        {/* KJB NOTE: onChange fired when <Tab> clicked, passing new active <Tab> value */}
        <Tabs value={activeTabId}
              onChange={tabChanged}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto">
          {tabs.map( tab => <Tab className={tab.tabId===previewTabId ? classes.tabPreview : classes.tabPermanent}
                                 key={tab.tabId}
                                 value={tab.tabId}
                                 label={tab.tabName}/> )}
        </Tabs>
      </AppBar>
      {tabs.map( tab => (
         <TabPanel key={tab.tabId} tabId={tab.tabId} activeTabId={activeTabId}>
           do dynamics here for {tab.tabId}/{tab.tabName}
         </TabPanel>
       ) )}
    </>
  );
}

const useStyles = makeStyles( theme => ({
  tabPreview: {
    fontStyle: 'italic',
  },
  tabPermanent: {
  },
}) );


// KJB TODO: consider moving TabPanel out into it's own module (possibly NOT if we only use it here)
const TabPanel = ({tabId, activeTabId, children}) => (
  <Paper hidden={tabId !== activeTabId}>
    {/* KJB TODO: do we need box? ... is providing some padding */}
    <Box p={2}>
      {children}
    </Box>
  </Paper>
);
