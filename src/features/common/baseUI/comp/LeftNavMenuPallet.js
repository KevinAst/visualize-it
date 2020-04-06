import React                    from 'react';
import PropTypes                from 'prop-types';

import {useDispatch}            from 'react-redux';
import {useFassets}             from 'feature-u';
import {useSelector,
        shallowEqual}           from 'react-redux';

import {tabRegistry,
        TabControllerScene,
        TabControllerCollage,
        TabControllerCompRef}   from 'features/xtra';

import genDualClickHandler      from 'util/genDualClickHandler';
import {createLogger}           from 'util/logger';
import {isPlainObject,
        isSmartObject,
        isClass}                from 'util/typeCheck';

import Scene                    from 'core/Scene';
import Collage                  from 'core/Collage';
import CompRef                  from 'core/CompRef';
import SmartClassRef            from 'core/SmartClassRef';

import {LeftNavCollapsibleItem} from 'features/xtra';
import ExpandLessIcon           from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon           from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import TreeItem                 from '@material-ui/lab/TreeItem';
import TreeView                 from '@material-ui/lab/TreeView';
import {makeStyles}             from '@material-ui/core/styles';


// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <LeftNavMenuPallet> ... ').disable();


/**
 * The top-level left-nav menu pallet visualizing the supplied SmartPkg.
 */
function LeftNavMenuPallet({smartPkg}) {

  const classes     = useStyles();
  const dispatch    = useDispatch();
  const activateTab = useFassets('actions.activateTab');

  // PERF: consider useCallback()
  //       HOWEVER not really needed (I THINK)
  //       ... due to the top-level memoization of LeftNavMenuPallet
  // NOTE: technically 2nd param (tabName) is NOT needed, but kept for diagnostic logging
  const handleActivateTab = (tabId, tabName, preview) => {
    log(`handleActivateTab( tabId:'${tabId}', tabName:'${tabName}', preview=${preview} )`);
    dispatch( activateTab(tabId, preview) );
  };

  const dualHandleActivateTab = genDualClickHandler(
    (tabId, tabName) => handleActivateTab(tabId, tabName, true), // singleClick: preview   tab ... preview is true
    (tabId, tabName) => handleActivateTab(tabId, tabName, false) // doubleClick: permanent tab ... preview is false
  );

  const fassets = useFassets();
  const inSync  = useSelector((appState) => fassets.sel.isEPkgInSync(appState, smartPkg.getEPkgId()), shallowEqual); // AI: see note on shallowEqual (below)
  const name    = smartPkg.getPkgName() + (inSync ? '' : ' **'); // AI: consider color too

  // render our TreeView/TreeItem generation process driven by smartPkg content!
  log(`rendering top-level content for smartPkg.id: ${smartPkg.id} ... expecting ONE TIME (for this entry)`);
  // console.log(`xx rendering top-level <LeftNavMenuPallet> content for smartPkg.id: ${smartPkg.id} ... expecting ONE TIME (for this entry)`);
  return (
    <LeftNavCollapsibleItem name={name}>
      <TreeView className={classes.root}
                defaultCollapseIcon={<ExpandLessIcon/>}
                defaultExpandIcon={<ExpandMoreIcon/>}>
        { genTreeItems(smartPkg, dualHandleActivateTab) }
      </TreeView>
    </LeftNavCollapsibleItem>
  );

}

// props validation
LeftNavMenuPallet.propTypes = {
  smartPkg: PropTypes.object.isRequired, // a SmartPkg object
};

// PERF: memo is critical (re-render is frequent and we do a lot of processing to generate our render)
//       - bypasses renderer if props are the same (can override shallow comparison with a second fn param to memo()
//       - also still allows re-render on hooks direction
export default React.memo(LeftNavMenuPallet);

// styling
const useStyles = makeStyles( theme => ({
  root: {
    // height: 216, // WowZee: Omitting height FIXED the tree, allowing it's height to grow dynamically
    flexGrow: 1,
    maxWidth: 400,
  },
}) );


// generate TreeItem structure (with depth) driven from the supplied smartPkg
function genTreeItems(smartPkg, handleActivateTab) {

  // recursive accumulation of all TreeItems (returns DOM Array)
  function accumTreeItems(entry, accumulativeId=smartPkg.getPkgId()) {

    // for plain objects, each member is a directory node
    if (isPlainObject(entry)) {

      const directoryAccum = [];

      // pass through through all directory nodes (object members),
      // ... generated a TreeItem directory node
      // ... and recurse into each
      for (const dirName in entry) {
        const dirContent = entry[dirName];

        const id = `${accumulativeId}-${dirName}`;

        log(`genTreeItems(): TreeItem directory node: ${dirName}`);
        directoryAccum.push((
          <TreeItem key={id}
                    nodeId={id}
                    label={dirName}>
            {accumTreeItems(dirContent, id)}
          </TreeItem>
        ));
      }

      return directoryAccum;
    }

    // for array entries
    else if (Array.isArray(entry)) {

      const entryAccum = entry.map( (arrItem) => {

        // normally this is a smartObj ... generate entry to be displayed in our tabManager
        if (isSmartObject(arrItem)) {

          const smartObj = arrItem;
          const nodeId   = `${accumulativeId}-${smartObj.id}`;

          // register this entry to our tabManager (allowing it to be visualized)
          let tabController = null;
          if (smartObj instanceof Scene) {
            tabController = new TabControllerScene(nodeId, smartObj.name, smartObj);
          }
          else if (smartObj instanceof Collage) {
            tabController = new TabControllerCollage(nodeId, smartObj.name, smartObj);
          }
          else {
            const errMsg = `***ERROR*** <LeftNavMenuPallet> found UNSUPPORTED smartObj entry (under accumulativeId: ${nodeId})  ... must be a Scene or Collage ... see logs for entry`
            console.error(errMsg, {smartObj});
            throw new Error(errMsg);
          }
          tabRegistry.registerTab(tabController);

          log(`genTreeItems(): TreeItem tabManager node ... nodeId: ${nodeId}`);
          return (
            <SmartTreeItem key={nodeId}
                           nodeId={nodeId}
                           ePkg={smartObj}
                           onClick={() => handleActivateTab(nodeId, smartObj.name)}/>
          );
        }

        // can be a real class reference
        else if (isClass(arrItem)) {
          const compClass = arrItem;

          // create our CompRef HERE, PRETENDING it was already in the smartPkg :-)
          // ... ?? ultimately this will be accomplished at the time we are creating our SmartPkg entries
          const compClassRef = new SmartClassRef(compClass, smartPkg.getPkgId());
          const compName     = compClassRef.getClassName();
          const nodeId       = `${accumulativeId}-${compName}`;
          const compRef      = new CompRef({id:compName, name:compName, compClassRef});
          compRef.setParent(smartPkg);

          // register this entry to our tabManager (allowing it to be visualized)
          tabRegistry.registerTab( new TabControllerCompRef(nodeId, compName, compRef) );
          
          log(`genTreeItems(): TreeItem tabManager node ... nodeId: ${nodeId}`);
          return (
            <SmartTreeItem key={nodeId}
                           nodeId={nodeId}
                           ePkg={compRef}
                           onClick={() => handleActivateTab(nodeId, compName)}/>
          );

        }

        // can be a nested sub-directory (mixed in with our tab activation entries)
        else if (isPlainObject(arrItem)) {
          return accumTreeItems(arrItem, accumulativeId);
        }

        // other array items are NOT supported (should not happen - defensive only)
        else {
          const errMsg = `***ERROR*** <LeftNavMenuPallet> found UNSUPPORTED array entry (under accumulativeId: ${accumulativeId})  ... must be a smartObj or plain nested directory object ... see logs for entry`
          console.error(errMsg, {arrItem});
          throw new Error(errMsg);
        }
      });

      return entryAccum;
    }

    // other entries are NOT supported (should not happen - defensive only)
    else {
      const errMsg = `***ERROR*** <LeftNavMenuPallet> found UNSUPPORTED SmartPkg entry (under accumulativeId: ${accumulativeId})  ... must be a plain directory object or an array of smartObjs ... see logs for entry`
      console.error(errMsg, {entry});
      throw new Error(errMsg);
    }

  }

  // invoke our recursive routine
  return accumTreeItems(smartPkg.entries);
}


/**
 * <SmartTreeItem> is an `<TreeItem>` wrapper that employs redux state
 * for various artifacts which triggers appropriate refreshes
 * dynamically.
 *
 * NOTE: This component re-renders on parent re-expansion ... however
 *       I think this is due to the architecture of the MUI TreeItem!
 */
function SmartTreeItem({nodeId, ePkg, onClick}) {
  const fassets   = useFassets();
  // AI: Don't understand: Why by just adding this selector, it renders 100% of the time?
  //    ... should only re-render when inSync value changes
  //        ANSWER: - has to do with useSelector === semantics HOWEVER I would expect true/false to ALWAYS be ===
  //                  ... https://thoughtbot.com/blog/using-redux-with-react-hooks
  //                  ... https://react-redux.js.org/next/api/hooks#equality-comparisons-and-updates
  //                - for now, I used the shallowEqual
  //                - BUT I REALLY DON'T UNDERSTAND THIS
//const inSync = useSelector((appState) => fassets.sel.isEPkgInSync(appState, ePkg.getEPkgId()), [fassets]);    // AI: works but way to many unneeded renders
  const inSync = useSelector((appState) => fassets.sel.isEPkgInSync(appState, ePkg.getEPkgId()), shallowEqual); // AI: shallowEqual

  const label = ePkg.getName() + (inSync ? '' : ' **'); // AI: consider color too
  // console.log(`xx rendering child <SmartTreeItem label="${label}"> ... inSync: ${inSync} ... hopefully we can trigger re-renders on this`);
  return (
    <TreeItem {...{nodeId, label, onClick}}/>
  )
}

// props validation
SmartTreeItem.propTypes = {
  nodeId:   PropTypes.string.isRequired,
  ePkg:     PropTypes.object.isRequired,
  onClick:  PropTypes.func.isRequired,
};
