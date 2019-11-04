import React,
       {useMemo}       from 'react';

import {useFassets}    from 'feature-u';
import {makeStyles}    from '@material-ui/core/styles';

import Drawer          from '@material-ui/core/Drawer';
import List            from '@material-ui/core/List';

// AI: temp to see some hard-coded entries
import ListItem        from '@material-ui/core/ListItem';
import ListItemText    from '@material-ui/core/ListItemText';
import Divider         from '@material-ui/core/Divider';


/**
 * LeftNav: our LeftNav component that accumulates menu items via use contract.
 */
export default function LeftNav() {

  const leftNavItems        = useFassets('AppMotif.LeftNavItem.*@withKeys');
  const orderedLeftNavItems = useMemo(() => (
    [...leftNavItems].sort(([item1Key], [item2Key]) => item1Key.localeCompare(item2Key))
  ), [leftNavItems]);

  const classes = useStyles();

  // AI: have seen some usage of tabIndex in <div> under <Drawer> (unsure if needed)
  //     tabIndex={0} ... should be focus-able in sequential keyboard navigation, but its order is defined by the document's source order */}
  return (
    <Drawer className={classes.leftNav}
            variant="permanent"
            classes={{
              paper: classes.leftNavPaper,
            }}>

      <div className={classes.toolbarSpacer}/>

      <List>
        {/* AI: temp to see some hard-coded entries  */}
        <ListItem button>
          <ListItemText primary="Test 1"/>
        </ListItem>
        <ListItem button>
          <ListItemText primary="Test 2"/>
        </ListItem>
        <Divider/>
        <ListItem button>
          <ListItemText primary="Test 3"/>
        </ListItem>
        <ListItem button>
          <ListItemText primary="Test 4"/>
        </ListItem>
        {/* AI: production entries (via use contract) */}
        {orderedLeftNavItems.map( ([fassetsKey, LeftNavItem]) => <LeftNavItem key={fassetsKey}/> )}
      </List>
    </Drawer>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles( theme => ({
  leftNav: {
    width: drawerWidth,
    flexShrink: 0,
  },
  leftNavPaper: { // match same width in our LeftNav Drawer usage
    width: drawerWidth,
  },

  toolbarSpacer: theme.mixins.toolbar, // a minimum height spacer so it isn't covered up by the AppBar
}) );
