import React                from 'react';

import {useDispatch}        from 'react-redux';
import {useFassets}         from 'feature-u';

import genDualClickHandler  from 'util/genDualClickHandler';

import ExpandLessIcon       from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon       from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import TreeItem             from '@material-ui/lab/TreeItem';
import TreeView             from '@material-ui/lab/TreeView';
import {makeStyles}         from '@material-ui/core/styles';

//???????????

import Konva           from 'konva';

import SmartViewReact  from 'util/SmartViewReact';
import SmartView       from 'core/SmartView';
import SmartComp       from 'core/SmartComp';


/**
 * KonvaMenuPallet: 
 *
 * A sandbox pallet showcasing visualize-it integration's with Konva.
 */
export default function KonvaMenuPallet() {

  const classes     = useStyles();
  const activateTab = useFassets('actions.activateTab');
  const dispatch    = useDispatch();

  // TODO: determine if this is causing unneeded re-renders
  //       - should we need to cache this function  via useCallback()
  //         DON'T THINK IT WOULD HELP, BECAUSE: I am creating multiple inline funcs within the render (below)
  //       - if needed, potential fix would be to cache multiple functions (with implied second tabId param)
  //         ... https://medium.com/@Charles_Stover/cache-your-react-event-listeners-to-improve-performance-14f635a62e15
  const handleActivateTab = (tabId, tabName, dedicated=false) => {
    console.log(`?? handleActivateTab( tabId:'${tabId}', tabName:'${tabName}', dedicated=${dedicated} )`);
    dispatch( activateTab({ // TODO: simulated TabControl
      tabId: 'tabId-'+tabId,
      tabName,
      dedicated,
      contentCreator: { // ??$$ now is the time to flesh out HOW  dynamic contentCreator accomplished
        Poop: () => <SmartViewReact view={myView1}/>,
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

  // ?? currently tree is hard-coded ... do we want to drive from a data structure?
  return (
    <TreeView className={classes.root}
              defaultCollapseIcon={<ExpandLessIcon/>}
              defaultExpandIcon={<ExpandMoreIcon/>}>

      <TreeItem nodeId="KSB" label="Simple Tests">
        <TreeItem nodeId="KSB-1" label="WowZee"  onClick={ ()=> dualHandleActivateTab('KSB-1', 'WowZee') }/>
      </TreeItem>

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


// ????????????????????????????????????????????????????????????????????????????????


// TODO: move into compLib/plumbing ... define index.js semantics
class Valve1 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  manifest(container) {
    const shape = new Konva.Rect({
      x: 20, // TODO: parameterize with defaults (needed for persistence)
      y: 20,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4
    });
    container.add(shape);
  }
}

// TODO: move into compLib/plumbing ... define index.js semantics
class Valve2 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  manifest(container) {
    const shape = new Konva.Rect({
      x: 150, // TODO: parameterize with defaults (needed for persistence)
      y: 40,
      width: 100,
      height: 50,
      fill: 'red',
      shadowBlur: 10,
      cornerRadius: 10
    });
    container.add(shape);
  }
}

// TODO: move into compLib/plumbing ... define index.js semantics
class Valve3 extends SmartComp {

  // useless-constructor ... because no logic besides super() with identical signature
  // constructor(id) {
  //   super(id);
  // }

  manifest(container) {
    const shape = new Konva.Rect({
      x: 50,  // TODO: parameterize with defaults (needed for persistence)
      y: 120,
      width: 100,
      height: 100,
      fill: 'blue',
      cornerRadius: [0, 10, 20, 30]
    });
    container.add(shape);
  }
}


//******************************************************************************
// KJB: Here is my instantiated SmartView object
//      NOTE 1: it is VERY light-weight UNTIL it is manifest!!
//      NOTE 2: KEY: This structure is 
//                   A. managed through our interactive editor,
//                      A1. need to monitor/sync these "edit" changes
//                      A2. because of "interactive editor", parameterization is minimal
//                   B. persisted as part of our "bundler"
//                   C. used at run-time through the "bundled" resources
//                      C1. don't think we need to monitor/sync any "animation" changes
//                          ... because this is NOT persisted
const myView1 = new SmartView('myView1', [
  new Valve1('myValve1'),
  new Valve2('myValve2'),
  new Valve3('myValve3'),
]);
//? myView1.x = 30; // ?? crude for now
//? myView1.y = 30;

