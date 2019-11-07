import React           from 'react';
import AppBar          from '@material-ui/core/AppBar';
import Tabs            from '@material-ui/core/Tabs';
import Tab             from '@material-ui/core/Tab';
import Paper           from '@material-ui/core/Paper';
import Box             from '@material-ui/core/Box';

/**
 * TabManager: Our top-level manager of tabs.
 */
export default function TabManager() {

  // KJB TODO: we MUST insure that when tabs exist, one is always ACTIVE ... if some error condition, just choose last one
  // KJB NOTE: tabId will be something unique - derived from our tabCntl
  const [activeTabId, setActiveTabId] = React.useState('TEST TAB 1');

  const handleChange = (event, newActiveTabId) => {
    // console.log(`xx active tab changed, newActiveTabId=${newActiveTabId}`);
    setActiveTabId(newActiveTabId);
  };

  return (
    <>
      <AppBar position="static" color="default">
        {/* KJB NOTE: <Tabs> value IS the currently selected Tab value ... can be false (no tab selected - all that useful) */}
        {/* KJB NOTE: onChange= fired when <Tab> clicked, passing new active <Tab> value */}
        <Tabs value={activeTabId}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto">
          {/* our tabs */}
          <Tab value="TEST TAB 1" label="Item One"/>
          <Tab value="TEST TAB 2" label="Item Two"/>
          {/* KJB NOTE: comment following out to see small number of tabs */}
          <Tab value="TEST TAB 3" label="Item Three"/>
          <Tab value="TEST TAB 4" label="Item Four"/>
          <Tab value="TEST TAB 5" label="Item Five"/>
          <Tab value="TEST TAB 6" label="Item Six"/>
          <Tab value="TEST TAB 7" label="Item Seven"/>
        </Tabs>
      </AppBar>

      {/* KJB NOTE: our TabPanels ... content is app-specific ... derived from tabCntl */}
      {/* KJB NOTE: these props are ONLY used to determine visibility */}
      <TabPanel tabId="TEST TAB 1" activeTabId={activeTabId}>
        Item One
      </TabPanel>

      <TabPanel tabId="TEST TAB 2" activeTabId={activeTabId}>
        Item Two
      </TabPanel>

      <TabPanel tabId="TEST TAB 3" activeTabId={activeTabId}>
        Item Three
      </TabPanel>

      <TabPanel tabId="TEST TAB 4" activeTabId={activeTabId}>
        Item Four
      </TabPanel>

      <TabPanel tabId="TEST TAB 5" activeTabId={activeTabId}>
        Item Five
      </TabPanel>

      <TabPanel tabId="TEST TAB 6" activeTabId={activeTabId}>
        Item Six
      </TabPanel>

      <TabPanel tabId="TEST TAB 7" activeTabId={activeTabId}>
        Item Seven
      </TabPanel>
    </>
  );
}


// KJB TODO: consider moving TabPanel out into it's own module (possibly NOT if we only use it here)
// KJB TODO: not sure I like passing activeTabId down ... I think this is causing needless re-rendering ... should be better when we get this from redux state
const TabPanel = ({tabId, activeTabId, children}) => (
  <Paper hidden={tabId !== activeTabId}>
    {/* KJB TODO: do we need box? ... is providing some padding */}
    <Box p={2}>
      {children}
    </Box>
  </Paper>
);
