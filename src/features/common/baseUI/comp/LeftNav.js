import React,
       {useMemo}       from 'react';

import {useFassets}    from 'feature-u';
import {makeStyles}    from '@material-ui/core/styles';

import Drawer          from '@material-ui/core/Drawer';
import List            from '@material-ui/core/List';
import Toolbar         from '@material-ui/core/Toolbar';

// AI: temp to see some hard-coded entries
import ListItem        from '@material-ui/core/ListItem';
import ListItemText    from '@material-ui/core/ListItemText';
import Divider         from '@material-ui/core/Divider';

// AI: test in support of MenuPallet
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Paper          from '@material-ui/core/Paper';
import Typography     from '@material-ui/core/Typography';

// AI: test in support of CustomizedTreeView
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';
import { fade, /*makeStyles,*/ withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
//import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support


// AI: test in support of SimpleTreeView
//import { makeStyles } from '@material-ui/core/styles';
//import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
//import TreeItem from '@material-ui/lab/TreeItem';

// ?? TEMP TEST of dynamic TabManager:
import {useDispatch}   from 'react-redux'
import _tabManagerAct  from '../../tabManager/actions'; // ?? needs to be promoted through a fassets

/**
 * LeftNav: our LeftNav component that accumulates menu items via use contract.
 */
export default function LeftNav() {

  const leftNavItems        = useFassets('AppMotif.LeftNavItem.*@withKeys');
  const orderedLeftNavItems = useMemo(() => (
    [...leftNavItems].sort(([item1Key], [item2Key]) => item1Key.localeCompare(item2Key))
  ), [leftNavItems]);

  const classes = useStyles();

  return (
    <Drawer className={classes.leftNav}
            variant="permanent"
            classes={{
              paper: classes.leftNavPaper,
            }}>

      <Toolbar variant="dense"
               comment="spacer (hidden UNDER AppBar) so our LeftNav isn't covered up by the AppBar"/>

      <List>
        {/* AI: temp to see some hard-coded entries  */}

        {/* SIMPLE TEST
        <ListItem button>
          <ListItemText primary="Test 1"/>
        </ListItem>
        <Divider/>
         */}

        <MenuPallet name="ACME System">
          <Typography variant="body2"
                      color="inherit"
                      noWrap>
            WowZee WowZee WooWoo ... This can be anything ... I hope it works.
          </Typography>
          <Typography variant="body2"
                      color="inherit"
                      noWrap>
            Here we go!!!
          </Typography>
        </MenuPallet>
        <Divider/>

        <MenuPallet name="Plumbing Comps">
          <CustomizedTreeView/>
        </MenuPallet>
        <Divider/>

        <MenuPallet name="Electrical Comps">
          <SimpleTreeView/>
        </MenuPallet>
        <Divider/>

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

    //? // AI: try some simple css (advanced) TO implement resizing
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


//****************************************************************************************
//*** AI: hard-coded test to:
//***     apply technique to allow LeftNav to accommodate a pallet for Systems/Components
//***      WITH tree support
//****************************************************************************************

function MenuPallet({name, children}) {

  const classes = usePalletStyles();
  const [open, setOpen] = React.useState(false);

  const handleClick = () => { // AI: do we need useMemo here?
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon/>{/* AI: parameterize */}
        </ListItemIcon>
        <ListItemText primary={name}/>
        {open ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      {/* AI NOTE: removed "unmountOnExit" attribute, because it was causing tree expansion to loose state */}
      <Collapse in={open} timeout="auto">
        <Paper className={classes.pallet}>
          {children}
        </Paper>
      </Collapse>
    </>
  );
}

const usePalletStyles = makeStyles( theme => ({ // AI: really is useStyles(), but now we don't want to conflict with this module
  pallet: {
    margin:  theme.spacing(0, 2, 2, 2),
    padding: theme.spacing(1),
  },
}) );




//****************************************************************************************
//*** AI: hard-coded test to see tree view
//***     TAKEN FROM: Customized tree view
//***                 https://material-ui.com/components/tree-view/#custom-icons-border-and-animation
//****************************************************************************************

// NOTE: Trees are currently part of the Material-UI lab (incubator NOT ready for core), and must be installed separately
//       $ npm install --save @material-ui/lab

// ALSO: this advanced demo requires react-spring (an animation library)
//       $ npm install --save react-spring


function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

const StyledTreeItem = withStyles(theme => ({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
  },
}))(props => <TreeItem {...props} TransitionComponent={TransitionComponent} />);


const useTreeStyles = makeStyles( theme => ({ // AI: really is useStyles(), but now we don't want to conflict with this module
  root: {
    // height: 264, // WowZee: NOT specifying height FIXED the tree, allowing it's height to grow dynamically
    flexGrow: 1,
    maxWidth: 400,
  },
}) );

function CustomizedTreeView() {
  const classes = useTreeStyles();

  return (
    <TreeView className={classes.root}
              defaultExpanded={['1']}
              defaultCollapseIcon={<MinusSquare />}
              defaultExpandIcon={<PlusSquare />}
              defaultEndIcon={<CloseSquare />}>
      <StyledTreeItem nodeId="1" label="Main">
        <StyledTreeItem nodeId="2" label="Hello" />
        <StyledTreeItem nodeId="3" label="Sub-Children">
          <StyledTreeItem nodeId="6" label="Hello" />
          <StyledTreeItem nodeId="7" label="Sub-Children">
            <StyledTreeItem nodeId="9" label="Child 1" />
            <StyledTreeItem nodeId="10" label="Child 2" />
            <StyledTreeItem nodeId="11" label="Child 3" />
          </StyledTreeItem>
          <StyledTreeItem nodeId="8" label="Hello" />
        </StyledTreeItem>
        <StyledTreeItem nodeId="4" label="World" />
        <StyledTreeItem nodeId="5" label="Something Else" />
      </StyledTreeItem>
    </TreeView>
  );
}




//****************************************************************************************
//*** AI: hard-coded test to see SIMPLE tree view
//***     TAKEN FROM: Tree View
//***                 https://material-ui.com/components/tree-view/#tree-view
//****************************************************************************************

// NOTE: Trees are currently part of the Material-UI lab (incubator NOT ready for core), and must be installed separately
//       $ npm install --save @material-ui/lab


const useSimpleTreeStyles = makeStyles( theme => ({ // AI: really is useStyles(), but now we don't want to conflict with this module
  root: {
    // height: 216, // WowZee: NOT specifying height FIXED the tree, allowing it's height to grow dynamically
    flexGrow: 1,
    maxWidth: 400,
  },
}) );


// ??$$ we have to deal with the React KRAP with onClick firing WITH onDoubleClick
// ?? move into own util/module
// utilize this function when registering BOTH onClick and onDoubleClick
// ... React has really dropped the ball, because if you register 
//     BOTH onClick and onDoubleClick, the onClick will fire in addition to onDoubleClick
//     KEY: THE OBVIOUS SOLUTION is for React to specify an onSingleClick ... geeeze
function genDualClickHandler(onSingleClick, onDoubleClick, delay=250) {
  let timeoutID = null;
  return function (...rest) { // onClick will pass event, but use ...rest to support any signature
    if (!timeoutID) { // FIRST CLICK: create timeout (waiting for potential second click)
      timeoutID = setTimeout(function () {
        onSingleClick(...rest); // invoke onSingleClick() - timeout has passed (with no additional clicks)
        timeoutID = null;       // reset our timeout indicator
      }, delay);
    }
    else { // SECOND CLICK (within timeout period)
      clearTimeout(timeoutID); // clear our timeout
      timeoutID = null;        // reset our timeout indicator
      onDoubleClick(...rest);  // invoke onDoubleClick(event)
    }
  };
}

function SimpleTreeView() {
  const classes = useSimpleTreeStyles();

  // ?? very temp test
  const dispatch     = useDispatch();

  // ??$$ just move these functions OUT (except I need dispatch ... grrrrr)
  // ?? do we need some memo or useCallback ... we are actually calling it INSIDE our jsx (below)
  const activateTab = (tabId, tabName, dedicated=false) => {
    console.log(`?? activateTab() with dedicated=${dedicated}`);
    dispatch( _tabManagerAct.activateTab({ // ?? simulated TabControl
      tabId,
      tabName,
      dedicated,
      contentCreator: {
        contentType: 'WowZee_system_view',
        contentContext: {
          whatever: 'poop',
        }
      },
    }) );
  };

  // ?? do we need some memo or useCallback
  const handleActivateTab = genDualClickHandler(
    (tabId, tabName) => activateTab(tabId, tabName, false), // singleClick
    (tabId, tabName) => activateTab(tabId, tabName, true)   // doubleClick
  );

  return (
    <TreeView className={classes.root}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}>
      <TreeItem nodeId="1" label="Applications">
        <TreeItem nodeId="2" label="Calendar"
                  onClick={ ()=> handleActivateTab('tabId1', 'Calendar') }/>
        <TreeItem nodeId="3" label="Chrome"
                  onClick={ ()=> handleActivateTab('tabId2', 'Chrome') }/>
        <TreeItem nodeId="4" label="Webstorm"
                  onClick={ ()=> handleActivateTab('tabId3', 'Webstorm') }/>
      </TreeItem>
      <TreeItem nodeId="5" label="Documents">
        <TreeItem nodeId="6" label="Material-UI">
          <TreeItem nodeId="7" label="src">
            <TreeItem nodeId="8" label="index.js"
                      onClick={ ()=> handleActivateTab('tabId8', 'index.js') }/>
            <TreeItem nodeId="9" label="tree-view.js"
                      onClick={ ()=> handleActivateTab('tabId89', 'tree-view.js') }/>
          </TreeItem>
        </TreeItem>
      </TreeItem>
    </TreeView>
  );
}
