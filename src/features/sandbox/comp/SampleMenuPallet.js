import React           from 'react';

import {useDispatch}   from 'react-redux'
import {useFassets}    from 'feature-u'

import ExpandLessIcon  from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon  from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import TreeItem        from '@material-ui/lab/TreeItem';
import TreeView        from '@material-ui/lab/TreeView';
import {makeStyles}    from '@material-ui/core/styles';

/**
 * SampleMenuPallet: 
 *
 * A very SIMPLE test pallet fleshing out details of:
 *   - a collapsible TreeView
 *   - tabManger interactions
 */
export default function SampleMenuPallet() {

  const classes     = useStyles();
  const activateTab = useFassets('actions.activateTab');
  const dispatch    = useDispatch();

  // TODO: determine if this is causing unneeded re-renders
  //       - should we need to cache this function  via useCallback()
  //         DON'T THINK IT WOULD HELP, BECAUSE: I am creating multiple inline funcs within the render (below)
  //       - if needed, potential fix would be to cache multiple functions (with implied second tabId param)
  //         ... https://medium.com/@Charles_Stover/cache-your-react-event-listeners-to-improve-performance-14f635a62e15
  const handleActivateTab = (tabId, tabName, dedicated=false) => {
    // console.log(`xx handleActivateTab( tabId:'${tabId}', tabName:'${tabName}', dedicated=${dedicated} )`);
    dispatch( activateTab({ // TODO: simulated TabControl
      tabId: 'tabId-'+tabId,
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

  // TODO: determine if this is causing unneeded re-renders (SEE ABOVE)
  const dualHandleActivateTab = genDualClickHandler(
    (tabId, tabName) => handleActivateTab(tabId, tabName, false), // singleClick
    (tabId, tabName) => handleActivateTab(tabId, tabName, true)   // doubleClick
  );


  // AI: crude test of closing pallet works WORKS
  // const handleClosePallet = () => {
  //   dispatch( _baseUIAct.removeLeftNavItem('MyCrudeTest1') );
  // };
  // ... inject (below)
  // <TreeItem nodeId="DD" label="Delete Me"    onClick={handleClosePallet}/>


  // // PUNT-FOR-NOW: see if treeViewOnNodeToggle helps
  // // BAD: NO HELP, only invoked on non-concrete nodes when toggled
  // // PUNT-FOR-NOW: see how this is implemented, so I could possibly wrap in my own class
  // //      ... https://github.com/mui-org/material-ui/blob/master/packages/material-ui-lab/src/TreeView/TreeView.js
  // //      ... c:/data/tech/dev/project/visualize-it/temp.TreeView.js
  // //          GEEZE: they are registering all kinds of functions inlined in the render
  // const treeViewOnNodeToggle = (nodeId, expanded) => {
  //   console.log(`xx treeViewOnNodeToggle(nodeId:'${nodeId}', expanded:${expanded})`);
  // };
  // // USED AS FOLLOWS:
  // //   <TreeView className={classes.root}
  // //             onClick={treeViewOnClick}            <<< this is it
  // //             onNodeToggle={treeViewOnNodeToggle}  <<< this is it
  // //             ...
  // //             defaultCollapseIcon={<ExpandLessIcon/>}
  // //             defaultExpandIcon={<ExpandMoreIcon/>}>
  // 
  // 
  // // PUNT-FOR-NOW: flesh out treeViewOnClick using onClick
  // const treeViewOnClick = (e) => {
  //   console.log(`xx treeViewOnClick() e:`, e);
  //   console.log(`xx treeViewOnClick() e.target:`, e.target);
  //   console.log(`xx treeViewOnClick() e.target.nodeName:`, e.target.nodeName);
  //   console.log(`xx treeViewOnClick() e.target.attributes:`, e.target.attributes);
  //   console.log(`xx treeViewOnClick() e.target.getAttribute('class'):`, e.target.getAttribute('class'));
  //   console.log(`xx treeViewOnClick() e.target.getAttribute('id'):`, e.target.getAttribute('id'));
  // };
  // 
  // // PUNT-FOR-NOW: flesh out treeViewOnClick
  // //      BAD: TreeItem's nodeId and label attributes are swallowed up, presumably retained in internal JS state, nowhere to be found in the DOM
  // //      BAD: try adding a standard attribute, like id
  // //           this id gets added to an intermediate node that we don't have access to
  // //           >>> it may be possible to get this node somehow
  // //               even if you could, the code would be VERY BRITTLE (subsequent versions may break this)
  // //      BOTTOM LINE: I think the only thing you can rely on is what is injected in the synthetic event
  // //      RESEARCH: WONDER if I can supplement the event that is propagated up?
  // //                I think this would defeat the purpose, as it would require a newly generated arrow at the lowest level!!!
  // //      RESEARCH: WONDER if there is a way I can gen a cached function

  // KOOL: here is our TreeView/TreeItem generation process driven by our data!
  return (
    <TreeView className={classes.root}
              defaultCollapseIcon={<ExpandLessIcon/>}
              defaultExpandIcon={<ExpandMoreIcon/>}>

      { genTreeItemFromData(sampleData, dualHandleActivateTab) }

    </TreeView>
  );

}

const useStyles = makeStyles( theme => ({
  root: {
    // height: 216, // WowZee: Omitting height FIXED the tree, allowing it's height to grow dynamically
    flexGrow: 1,
    maxWidth: 400,
  },
}) );


//******************************************************************************
//*** Data Driven Process
//*** ... a key aspect of this sample is to determine how to drive
//***     our process through data!!
//******************************************************************************

// NOTE: A KEY aspect of this sample is to determine how to drive our
//       process through data!!
// 
//       KEY Processing Points:
//       - leaf nodes (without children) will activate tab entries
//         ... determined by the non-existence of nodes (i.e. no children)
//       - this component (SampleMenuPallet) will combine all ids within the tree depth to assist in it's uniqueness

const sampleData = [
  {id: 'P', label: 'Passive',
   nodes: [
     {id: '1', label: 'Resistors'},
     {id: '2', label: 'Capacitors'},
     {id: '3', label: 'Inductors'},
   ],
  },
  {id: 'A', label: 'Active',
   nodes: [
     {id: '1', label: 'Diodes'},
     {id: '2', label: 'Transistors'},
   ],
  },
  {id: 'M', label: 'More',
   nodes: [
     {id: 'D', label: 'Depth',
       nodes: [
         {id: 'D', label: 'Display',
           nodes: [
             {id: 'L', label: 'LCD'},
           ],
         },
         {id: 'P', label: 'Power',
           nodes: [
             {id: 'B', label: 'Battery'},
           ],
         },
       ],
     },
   ],
  },
];

// KOOL: our algorithm that interprets sampleData (above), generating TreeView/TreeItem structure USING recursion
function genTreeItemFromData(dataNodes, eventHandler, idPrefix='') {

  return dataNodes.map( (dataNode) => {

    const id = idPrefix ? (idPrefix + '-' + dataNode.id) : dataNode.id;

    // for non-leaf nodes (with children):
    // ... generate a parent TreeItem with child nodes USING recursion
    if (dataNode.nodes) {
      return (
        <TreeItem key={id}
                  nodeId={id}
                  label={dataNode.label}>
          {genTreeItemFromData(dataNode.nodes, eventHandler, id)}
        </TreeItem>
      );
    }

    // for leaf nodes (without children):
    // ... generate a leaf TreeItem with our registered event handler
    else {
      return (
        <TreeItem key={id}
                  nodeId={id}
                  label={dataNode.label}
                  onClick={ ()=> eventHandler(id, dataNode.label) }/>
      );
    }
  });

}

// console.log(`xx here is our generated SampleMenuPallet: `, genTreeItemFromData(sampleData));
// GENS FOLLOWING:
// <TreeItem nodeId="P" label="Passive">
//   <TreeItem nodeId="P-1" label="Resistors"  onClick={ ()=> dualHandleActivateTab('P-1', 'Resistors') }/>
//   <TreeItem nodeId="P-2" label="Capacitors" onClick={ ()=> dualHandleActivateTab('P-2', 'Capacitors') }/>
//   <TreeItem nodeId="P-3" label="Inductors"  onClick={ ()=> dualHandleActivateTab('P-3', 'Inductors') }/>
// </TreeItem>
// <TreeItem nodeId="A" label="Active">
//   <TreeItem nodeId="A-1" label="Diodes"      onClick={ ()=> dualHandleActivateTab('A-1', 'Diodes') }/>
//   <TreeItem nodeId="A-2" label="Transistors" onClick={ ()=> dualHandleActivateTab('A-2', 'Transistors') }/>
// </TreeItem>
// <TreeItem nodeId="M" label="More">
//   <TreeItem nodeId="M-D" label="Depth">
//     <TreeItem nodeId="M-D-D" label="Display">
//       <TreeItem nodeId="M-D-D-L" label="LCD"     onClick={ ()=> dualHandleActivateTab('M-D-D-L', 'LCD') }/>
//     </TreeItem>
//     <TreeItem nodeId="M-D-P" label="Power">
//       <TreeItem nodeId="M-D-P-B" label="Battery"  onClick={ ()=> dualHandleActivateTab('M-D-P-B', 'Battery') }/>
//     </TreeItem>
//   </TreeItem>
// </TreeItem>





//******************************************************************************
//*** move out
//******************************************************************************

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
