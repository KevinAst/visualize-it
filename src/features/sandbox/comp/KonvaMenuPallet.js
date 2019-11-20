import React                    from 'react';

import {useDispatch}            from 'react-redux';
import {useFassets}             from 'feature-u';

import konvaSandbox             from '../konvaSandbox';

import {registerTab}            from 'featureAssets';
import genDualClickHandler      from 'util/genDualClickHandler';
import {createLogger}           from 'util/logger';
import SmartViewReact           from 'util/SmartViewReact';

import {LeftNavCollapsibleItem} from 'featureAssets';
import ExpandLessIcon           from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon           from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import TreeItem                 from '@material-ui/lab/TreeItem';
import TreeView                 from '@material-ui/lab/TreeView';
import {makeStyles}             from '@material-ui/core/styles';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <KonvaMenuPallet> ... ').disable();

/**
 * KonvaMenuPallet: 
 *
 * A sandbox pallet showcasing visualize-it integration's with Konva.
 */
function KonvaMenuPallet() {

  const classes     = useStyles();

  const tabActivationHandlers = useTabActivationHandlers(konvaSandbox.nodes);

  // KOOL: here is our TreeView/TreeItem generation process driven by our data!
  return (
    <LeftNavCollapsibleItem name={konvaSandbox.desc}>
      <TreeView className={classes.root}
                defaultCollapseIcon={<ExpandLessIcon/>}
                defaultExpandIcon={<ExpandMoreIcon/>}>
        { genTreeItemFromData(konvaSandbox.nodes, tabActivationHandlers) }
      </TreeView>
    </LeftNavCollapsibleItem>
  );

}
// PERF: memo is critical (re-render is frequent and we do a lot of processing to generate our render)
export default React.memo(KonvaMenuPallet);

const useStyles = makeStyles( theme => ({
  root: {
    // height: 216, // WowZee: Omitting height FIXED the tree, allowing it's height to grow dynamically
    flexGrow: 1,
    maxWidth: 400,
  },
}) );



// our process for Tab Registration from our data structure
function registerTabsFromData(nodes, accumulativeId=konvaSandbox.id) {

  // iterate over all our direct children
  nodes.forEach( (node) => {
    const id = `${accumulativeId}-${node.id}`;

    // for non-leaf nodes (with children):
    // ... keep drilling into our structure USING recursion
    if (node.nodes) {
      log(`registerTabsFromData(): TreeItem non-leaf node ... id: ${id}`);
      registerTabsFromData(node.nodes, id);
    }

    // for leaf nodes (without children):
    // ... register this entry with our Tab Registry
    else {
      log(`registerTabsFromData(): TreeItem leaf node ... id: ${id}`);
      registerTab(id, node.desc, () => (
        <SmartViewReact view={node.smartView}/>
      ));
    }
  });
}
registerTabsFromData(konvaSandbox.nodes, konvaSandbox.id); // register our Tabs NOW!!!



// pre-carve out all the tabActivationHandlers we need in the entire process
// PERF: this is an optimization that minimizes re-rendering
//       due to anonymous function reference props constantly changing
//       HOWEVER not really a concern
//       ... due to the top-level memoization of KonvaMenuPallet
function useTabActivationHandlers(nodes) {

  const dispatch    = useDispatch();
  const activateTab = useFassets('actions.activateTab');

  log(`in useTabActivationHandlers()`);

  // PERF: consider useCallback()
  //       HOWEVER not really needed
  //       ... due to the top-level memoization of KonvaMenuPallet
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
  //       ... due to the top-level memoization of KonvaMenuPallet
  return genTabActivationHandlers(nodes, dualHandleActivateTab);

}

// the recursive generator
function genTabActivationHandlers(nodes,
                                  rootHandler,
                                  accumulativeId=konvaSandbox.id,
                                  handlers={}) {

  // iterate over all our direct children
  nodes.forEach( (node) => {
    const id = `${accumulativeId}-${node.id}`;

    // for non-leaf nodes (with children):
    // ... keep drilling into our structure USING recursion
    if (node.nodes) {
      log(`genTabActivationHandlers(): TreeItem non-leaf node ... id: ${id}, desc: ${node.desc}`);
      genTabActivationHandlers(node.nodes, rootHandler, id, handlers);
    }

    // for leaf nodes (without children):
    // ... accumulate the needed handler
    else {
      log(`genTabActivationHandlers(): TreeItem leaf node ... id: ${id}, desc: ${node.desc}`);
      // NOTE: technically 2nd param (tabName) is NOT needed, but kept for diagnostic logging
      handlers[id] = () => rootHandler(id, node.desc);
    }
  });

  return handlers;
}


// morph our data into TreeView/TreeItem structure USING recursion
function genTreeItemFromData(nodes, tabActivationHandlers, accumulativeId=konvaSandbox.id) {

  return nodes.map( (node) => {

    const id = `${accumulativeId}-${node.id}`;

    // for non-leaf nodes (with children):
    // ... generate a parent TreeItem with child nodes USING recursion
    if (node.nodes) {
      log(`genTreeItemFromData(): TreeItem non-leaf node ... id: ${id}`);
      return (
        <TreeItem key={id}
                  nodeId={id}
                  label={node.desc}>
          {genTreeItemFromData(node.nodes, tabActivationHandlers, id)}
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
                  label={node.desc}
                  onClick={tabActivationHandlers[id]}/>
      );
    }
  });

}
