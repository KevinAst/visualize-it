import React,
       {useMemo}                from 'react';

import {useFassets}             from 'feature-u';
import {makeStyles}             from '@material-ui/core/styles';

import Drawer                   from '@material-ui/core/Drawer';
import List                     from '@material-ui/core/List';
import Toolbar                  from '@material-ui/core/Toolbar';

import {getOrderedLeftNavItems} from '../state';
import {useSelector}            from 'react-redux'


/**
 * LeftNav: our LeftNav component that accumulates menu items 
 * via a programmatic API: fassets.action.activateTab()
 */
export default function LeftNav() {

  const classes = useStyles();

  // ??$$ OLD via usage contract OBSOLETE THIS
  const leftNavItems        = useFassets('AppMotif.LeftNavItem.*@withKeys');
  const orderedLeftNavItemsOLD = useMemo(() => (
    [...leftNavItems].sort(([item1Key], [item2Key]) => item1Key.localeCompare(item2Key))
  ), [leftNavItems]);

  const orderedLeftNavItems = useSelector((appState) => getOrderedLeftNavItems(appState), []);

  // LeftNav is dynamic, only displayed when it has entries
  if (orderedLeftNavItems.length <= 0) {
    return null;
  }

  return (
    <Drawer className={classes.leftNav}
            variant="permanent"
            classes={{
              paper: classes.leftNavPaper,
            }}>

      <Toolbar variant="dense"
               comment="spacer (hidden UNDER AppBar) so our LeftNav isn't covered up by the AppBar"/>

      <List>
        {/* AI: production entries (via use contract) ?? OBSOLETE THIS */}
        {orderedLeftNavItemsOLD.map( ([fassetsKey, LeftNavItem]) => <LeftNavItem key={fassetsKey}/> )}

        {orderedLeftNavItems.map( ([leftNavKey, LeftNavComp]) => <LeftNavComp key={leftNavKey}/> )}
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

    //? // AI: ?? try some simple css (advanced) TO implement resizing
    //? // RESULT: KINDA WORKS 
    //? //         - only operates in Chrome (NOT Edge) ... didn't test anything else
    //? //         - resizes the LeftNav GREAT
    //? //         - does NOT propagate to other elms (just overlays the main page) ... prob need some programmatic event handler
    //? //         - kinda quirky (with little corner frame)
    //? resize: 'horizontal', // KOOL: kinda works
    //? // NOT NEEDED: border: '1px solid #333',
    //? // NOT NEEDED: overflow: 'auto',
  },

}) );



