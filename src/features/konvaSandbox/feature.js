import {createFeature}    from 'feature-u';
//import route              from './route'; ?? obsolete

// ?? TEMP TEST of TreeView and MenuPallet
import ExpandLessIcon  from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon  from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import Divider         from '@material-ui/core/Divider';
import MenuPallet      from '../common/baseUI/comp/MenuPallet';
import React           from 'react';
import TreeItem        from '@material-ui/lab/TreeItem';
import TreeView        from '@material-ui/lab/TreeView';
import _tabManagerAct  from 'features/common/tabManager/actions'; // ?? needs to be promoted through a fassets
import {makeStyles}    from '@material-ui/core/styles';
import {useDispatch}   from 'react-redux'

// feature: konvaSandbox
//          sandbox to play with konva.js
export default createFeature({

  name: 'konvaSandbox',

  enabled: true, // ?? temp for now

  // route, // ?? obsolete this (with new tabManager)

  // ?? SIMPLE hard-coded test injecting MenuPallet into LeftNav via programmatic API
  appInit({showStatus, fassets, appState, dispatch}) {
    
    dispatch( fassets.actions.addLeftNavItem('MyCrudeTest2', () => (
      <>
        <MenuPallet name="MyCrudeTest2">
          <SimpleTreeView/>
        </MenuPallet>
        <Divider/>
        </>
    )) );

    dispatch( fassets.actions.addLeftNavItem('MyCrudeTest1', () => (
      <>
        <MenuPallet name="MyCrudeTest1">
          <SimpleTreeView/>
        </MenuPallet>
        <Divider/>
      </>
    )) );
    
  },

});



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


// ?? we have to deal with the React KRAP with onClick firing WITH onDoubleClick
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

export function SimpleTreeView() {
  const classes = useSimpleTreeStyles();

  // ?? very temp test
  const dispatch     = useDispatch();

  // NOTE: activateTab: DO WE need to cache via useCallback() ... I am creating multiple inline funcs within the render (below)
  //       TODO: ?? determine if this is causing unneeded re-renders (only fix would be to cache multiple functions (with implied second tabId param) ... https://medium.com/@Charles_Stover/cache-your-react-event-listeners-to-improve-performance-14f635a62e15
  const activateTab = (tabId, tabName, dedicated=false) => {
    // console.log(`xx activateTab() with dedicated=${dedicated}`);
    // ?? suspect activateTab should be promoted in fassets
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

  // ?? crude test WORKS
  //? const handleClosePallet = () => {
  //?   dispatch( _baseUIAct.removeLeftNavItem('MyCrudeTest1') );
  //? };
  //? ... inject (below)
  //? <TreeItem nodeId="DD" label="Delete Me"    onClick={handleClosePallet}/>


  // NOTE: handleActivateTab: DO WE need to cache via useCallback() ... I am creating multiple inline funcs within the render (below)
  //       TODO: ?? determine if this is causing unneeded re-renders (only fix would be to cache multiple functions (with implied second tabId param) ... https://medium.com/@Charles_Stover/cache-your-react-event-listeners-to-improve-performance-14f635a62e15
  const handleActivateTab = genDualClickHandler(
    (tabId, tabName) => activateTab(tabId, tabName, false), // singleClick
    (tabId, tabName) => activateTab(tabId, tabName, true)   // doubleClick
  );

  return (
    <TreeView className={classes.root}
              defaultCollapseIcon={<ExpandLessIcon/>}
              defaultExpandIcon={<ExpandMoreIcon/>}>
      <TreeItem nodeId="P" label="Passive">
        <TreeItem nodeId="P1" label="Resistors"  onClick={ ()=> handleActivateTab('tabIdP1', 'Resistors') }/>
        <TreeItem nodeId="P2" label="Capacitors" onClick={ ()=> handleActivateTab('tabIdP2', 'Capacitors') }/>
        <TreeItem nodeId="P3" label="Inductors"  onClick={ ()=> handleActivateTab('tabIdP3', 'Inductors') }/>
      </TreeItem>
      <TreeItem nodeId="A" label="Active">
        <TreeItem nodeId="A1" label="Diodes"      onClick={ ()=> handleActivateTab('tabIdA1', 'Diodes') }/>
        <TreeItem nodeId="A2" label="Transistors" onClick={ ()=> handleActivateTab('tabIdA2', 'Transistors') }/>
      </TreeItem>
      <TreeItem nodeId="X1" label="More">
        <TreeItem nodeId="X2" label="Depth">
          <TreeItem nodeId="D" label="Display">
            <TreeItem nodeId="L1" label="LCD"     onClick={ ()=> handleActivateTab('tabIdL1', 'LCD') }/>
          </TreeItem>
          <TreeItem nodeId="B" label="Power">
            <TreeItem nodeId="B1" label="Battery"  onClick={ ()=> handleActivateTab('tabIdB1', 'Battery') }/>
          </TreeItem>
        </TreeItem>
      </TreeItem>
    </TreeView>
  );
}
