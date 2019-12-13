import React           from 'react';

import {useDispatch}   from 'react-redux';
import {useFassets}    from 'feature-u';

import {LeftNavCollapsibleItem} from 'featureResources';
import {registerTab}            from 'featureResources';
import genDualClickHandler      from 'util/genDualClickHandler';
import {createLogger}           from 'util/logger';

import ExpandLessIcon  from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon  from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import TreeItem        from '@material-ui/lab/TreeItem';
import TreeView        from '@material-ui/lab/TreeView';
import {makeStyles}    from '@material-ui/core/styles';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <SampleMenuPallet> ... ').disable();


/**
 * SampleMenuPallet: 
 *
 * A very SIMPLE test pallet fleshing out details of:
 *   - a collapsible TreeView
 *   - tabManger interactions
 *   - optimizing react performance (renders) (see: PERF comments)
 */
function SampleMenuPallet() {

  const classes     = useStyles();

  const tabActivationHandlers = useTabActivationHandlers(sampleData);

  // KOOL: here is our TreeView/TreeItem generation process driven by our data!
  return (
    <LeftNavCollapsibleItem name="Sample Pallet">
      <TreeView className={classes.root}
                defaultCollapseIcon={<ExpandLessIcon/>}
                defaultExpandIcon={<ExpandMoreIcon/>}>
        { genTreeItemFromData(sampleData, tabActivationHandlers) }
      </TreeView>
    </LeftNavCollapsibleItem>
  );

}
// PERF: memo is critical (re-render is frequent and we do a lot of processing to generate our render)
export default React.memo(SampleMenuPallet);



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


const rootId = 'SampleMenuPallet';

// our process for Tab Registration from our data structure
function registerTabsFromData(dataNodes, accumulativeId=rootId) {

  // iterate over all our direct children
  dataNodes.forEach( (dataNode) => {
    const id = `${accumulativeId}-${dataNode.id}`;

    // for non-leaf nodes (with children):
    // ... keep drilling into our structure USING recursion
    if (dataNode.nodes) {
      log(`registerTabsFromData(): TreeItem non-leaf node ... id: ${id}`);
      registerTabsFromData(dataNode.nodes, id);
    }

    // for leaf nodes (without children):
    // ... register this entry with our Tab Registry
    else {
      log(`registerTabsFromData(): TreeItem leaf node ... id: ${id}`);
      registerTab(id, dataNode.label, () => (
        <span>Dynamic content for {id} / {dataNode.label}</span>
      ));
    }
  });
}
registerTabsFromData(sampleData); // register our Tabs NOW!!!


// pre-carve out all the tabActivationHandlers we need in the entire process
// PERF: this is an optimization that minimizes re-rendering
//       due to anonymous function reference props constantly changing
//       HOWEVER not really a concern
//       ... due to the top-level memoization of SampleMenuPallet
function useTabActivationHandlers(dataNodes) {

  const dispatch    = useDispatch();
  const activateTab = useFassets('actions.activateTab');

  log(`in useTabActivationHandlers()`);

  // PERF: consider useCallback()
  //       HOWEVER not really needed
  //       ... due to the top-level memoization of SampleMenuPallet
  // NOTE: technically 2nd param (tabName) is NOT needed, but kept for diagnostic logging
  const handleActivateTab = (tabId, tabName, preview) => {
    log(`handleActivateTab( tabId:'${tabId}', tabName:'${tabName}', preview=${preview} )`);
    dispatch( activateTab(tabId, preview) );
  };

  const dualHandleActivateTab = genDualClickHandler(
    (tabId, tabName) => handleActivateTab(tabId, tabName, true), // singleClick: preview   tab ... preview is true
    (tabId, tabName) => handleActivateTab(tabId, tabName, false) // doubleClick: permanent tab ... preview is false
  );

  // PERF: this is ALWAYS GOING TO return a new item 
  //       HOWEVER not really a concern
  //       ... due to the top-level memoization of SampleMenuPallet
  return genTabActivationHandlers(dataNodes, dualHandleActivateTab);

}

// the recursive generator
function genTabActivationHandlers(dataNodes,
                                  rootHandler,
                                  accumulativeId=rootId,
                                  handlers={}) {

  // iterate over all our direct children
  dataNodes.forEach( (dataNode) => {
    const id = `${accumulativeId}-${dataNode.id}`;

    // for non-leaf nodes (with children):
    // ... keep drilling into our structure USING recursion
    if (dataNode.nodes) {
      log(`genTabActivationHandlers(): TreeItem non-leaf node ... id: ${id}, label: ${dataNode.label}`);
      genTabActivationHandlers(dataNode.nodes, rootHandler, id, handlers);
    }

    // for leaf nodes (without children):
    // ... accumulate the needed handler
    else {
      log(`genTabActivationHandlers(): TreeItem leaf node ... id: ${id}, label: ${dataNode.label}`);
      // NOTE: technically 2nd param (tabName) is NOT needed, but kept for diagnostic logging
      handlers[id] = () => rootHandler(id, dataNode.label);
    }
  });

  return handlers;
}


// algorithm that morphs our sampleData into TreeView/TreeItem structure USING recursion
function genTreeItemFromData(dataNodes, tabActivationHandlers, accumulativeId=rootId) {

  return dataNodes.map( (dataNode) => {

    const id = `${accumulativeId}-${dataNode.id}`;

    // for non-leaf nodes (with children):
    // ... generate a parent TreeItem with child nodes USING recursion
    if (dataNode.nodes) {
      log(`genTreeItemFromData(): TreeItem non-leaf node ... id: ${id}`);
      return (
        <TreeItem key={id}
                  nodeId={id}
                  label={dataNode.label}>
          {genTreeItemFromData(dataNode.nodes, tabActivationHandlers, id)}
        </TreeItem>
      );
    }

    // for leaf nodes (without children):
    // ... generate a leaf TreeItem with our registered event handler
    else {
      log(`genTreeItemFromData(): TreeItem leaf node ... id: ${id}`);
      return (
        <TreeItem key={id}
                  nodeId={id}
                  label={dataNode.label}
                  onClick={tabActivationHandlers[id]}/>
      );
    }
  });

}

// EXAMPLE GENERATION (except the onClick has changed):
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
