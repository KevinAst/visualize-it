import React,
       {useCallback}   from 'react';

import {useSelector,
        useDispatch}   from 'react-redux'

import * as _tabManagerSel from '../state';
import _tabManagerAct      from '../actions';

import AppBar          from '@material-ui/core/AppBar';
import Box             from '@material-ui/core/Box';
import CloseIcon       from '@material-ui/icons/Close';
import Grid            from '@material-ui/core/Grid';
import Paper           from '@material-ui/core/Paper';
import Tab             from '@material-ui/core/Tab';
import Tabs            from '@material-ui/core/Tabs';
import Typography      from '@material-ui/core/Typography';
import {makeStyles}    from '@material-ui/core/styles';

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
    // console.log(`xx tabChanged('${newActiveTabId}')`);
    dispatch( _tabManagerAct.activateTab({ // simulated TabControl
      tabId: newActiveTabId,               // ... for existing tabs, only this attribute is used
    }) );
  }, [dispatch]);

  // NOTE: closeTab is currently NOT cached because I am creating multiple inline funcs within the render (below)
  //       TODO: ?? determine if this is causing unneeded re-renders (only fix would be to cache multiple functions (with implied second tabId param) ... https://medium.com/@Charles_Stover/cache-your-react-event-listeners-to-improve-performance-14f635a62e15
  const closeTab = (event, tabId) => {
    // console.log('xx in closeTab: ', tabId);
    event.stopPropagation(); // prevent parent event (tabChanged event) from firing ... if not done, it can fire AFTER closeTab - which is bad (because the tab is gone)
    dispatch( _tabManagerAct.closeTab(tabId) );
  };

  // NOTE: Our TabPanels content is app-specific (derived from tabControl)
  //       This content is dynamically created using a global contentCreator.
  //       TODO: ?? MUST INSURE this will NOT "Comp.manifest" multiple times

  // TABS NOTE: <Tabs> value IS the currently selected Tab value
  //            ... can be false - NO tab selected (NOT all that useful)
  //            ... onChange is fired when <Tab> clicked, passing new active <Tab> value

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs value={activeTabId}
              onChange={tabChanged}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto">
          {tabs.map( tab => (
             <Tab className={tab.tabId===previewTabId ? classes.tabPreview : classes.tabPermanent}
                  key={tab.tabId}
                  value={tab.tabId}
                  label={(
                    <Grid container
                          // force dual items to edge
                          justify="space-between">
                      <Grid item>
                        <Typography variant="subtitle2" color="inherit">
                          {tab.tabName}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <CloseIcon onClick={(e) => closeTab(e, tab.tabId)}/>
                      </Grid>
                    </Grid>
                  )}
             />)
           )}
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
