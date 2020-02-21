import React,
       {useCallback}       from 'react';

import {useSelector,
        useDispatch}       from 'react-redux'

import {createLogger}      from 'util/logger';

import * as _tabManagerSel from '../state';
import _tabManagerAct      from '../actions';
import tabManager          from '../tabManager';

import AppBar              from '@material-ui/core/AppBar';
import Box                 from '@material-ui/core/Box';
import CloseIcon           from '@material-ui/icons/Close';
import Grid                from '@material-ui/core/Grid';
import Paper               from '@material-ui/core/Paper';
import Tab                 from '@material-ui/core/Tab';
import Tabs                from '@material-ui/core/Tabs';
import Typography          from '@material-ui/core/Typography';
import {makeStyles}        from '@material-ui/core/styles';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <TabManager> ... ').disable();

/**
 * TabManager: Our top-level manager of tabs.
 */
export default function TabManager() {

  const classes = useStyles();

  const activeTabId  = useSelector((appState) => _tabManagerSel.getActiveTabId(appState), []);
  const previewTabId = useSelector((appState) => _tabManagerSel.getPreviewTabId(appState), []);
  const tabs         = useSelector((appState) => _tabManagerSel.getTabs(appState), []);
  const dispatch     = useDispatch();
  const handleTabChanged   = useCallback((event, tabId) => {
    log(`handleTabChanged('${tabId}')`);
    dispatch( _tabManagerAct.activateTab(tabId) );
  }, [dispatch]);

  // NOTE: handleCloseTab is currently NOT cached because I am creating multiple inline funcs within the render (below)
  const handleCloseTab = (event, tabId) => {
    log('in handleCloseTab: ', tabId);
    event.stopPropagation(); // prevent parent tabChanged event from firing ... if not done, it can fire AFTER closeTab - which is bad (because the tab is gone)
    dispatch( _tabManagerAct.closeTab(tabId) );
  };

  // PERF: TabManager renders 2 times every tab change ... performance doesn't appear to be a problem :-)
  log('rendering');

  // NOTE: Each TabPanel content is app-specific,
  //       dynamically created through the tab registry's tabCreator ReactComp.

  // TABS NOTE: <Tabs> value IS the currently selected Tab value
  //            ... can be false - NO tab selected (NOT all that useful)
  //            ... onChange is fired when <Tab> clicked, passing new active <Tab> value

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs value={activeTabId}
              onChange={handleTabChanged}
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
                        <CloseIcon onClick={(e) => handleCloseTab(e, tab.tabId)}/>
                      </Grid>
                    </Grid>
                  )}
             />)
           )}
        </Tabs>
      </AppBar>
      {tabs.map( tab => {
         const TabCreator = tabManager.getTabController(tab.tabId).getTabPanelComp(); // ... AI: may error - returns undefined if NOT registered?
         return (
           <TabPanel key={tab.tabId}
                     tabId={tab.tabId}
                     activeTabId={activeTabId}>
             {/* AI: this content will be dynamically rendered
           
                     NOTE: the following div/Box (if used) will show you the results of a big content and where the scroll bars appear
                          <div style={{height: 2000, width: 1000, border: '1px solid orange'}}>
           
                          <Box border={1}
                                borderColor="secondary.light">
           
                          <Box border={1}
                               borderColor="secondary.light"
                               width={1000}
                               height={2000}>
           
                               primary.light: green diff shade
                               primary.main:  green
                               primary.dark:  green diff shade
           
                               secondary.light: grayish <<< like this one
                               secondary.main:  purple
                               secondary.dark:  almost black
               */}
             <TabCreator/>
           </TabPanel>
         );
       } )}
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


// TODO: consider moving TabPanel out into it's own module (possibly NOT if we only use it here)
// TODO: something above TabPanel is giving it the full width
//       how to fill all vertical space?
//        - a style height: '100%' kinda works, but it doesn't account for filler under AppBar
//          ... style={{height: '100%'}}
//        - can use css calc(): 97px = 48px AppBar + 49px TabBar <<< number calculation is a real hack
//          ... style={{height: 'calc(100% - 97px)'}}
// NOTE: the box (below) is giving us a bit of styling (currently padding so as to not place content right up to the edge)
const TabPanel = ({tabId, activeTabId, children}) => (
  <Paper hidden={tabId !== activeTabId} style={{height: 'calc(100% - 97px)'}}>
    <Box padding={1}>
      {children}
    </Box>
  </Paper>
);
