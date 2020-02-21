import React          from 'react';
import ReactSmartView from 'util/ReactSmartView';

import TabController  from './TabController';

import verify         from 'util/verify';

import DispMode       from 'core/DispMode';
import Collage        from 'core/Collage';
import SmartView      from 'core/SmartView';


/**
 * TabControllerCollage is a concrete class that manages a specific Collage tab.
 */
export default class TabControllerCollage extends TabController {

  /**
   * Create a TabControllerCollage.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: compLibName/comp, or
   * systemName/view, etc.).
   *
   * @param {string} tabName the human interpretable name displayed in
   * the tab.
   *
   * @param {Collage} collage the collage being displayed/managed by this tab.
   */
  constructor(tabId, tabName, collage) {
    super(tabId, tabName);

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId/tabName done by base class
    // ... collage
    check(collage,                     'collage is required');
    check(collage instanceof Collage,  'collage must be a Collage object');

    // retain state specific to this derivation
    this.collage = collage;
  }

  // collage's are editable
  isEditable() {
    return true;
  }

  // manage DispMode settings (specific to collage)
  setDispMode(dispMode) {
    super.setDispMode(dispMode);

    //***
    //*** value added logic:
    //***

    // propagate setting into our object model
    if (dispMode === DispMode.edit) {
    }
    else if (dispMode === DispMode.view) {
    }
    else { // animate
    }
    // ?? do something ... within Collage API, pattern after: 
    //    ... src\features\sandbox\konvaSandbox\konvaSandboxSmartPkg.js
    //          collageView1.draggableCollage( !collageView1.draggableCollage() );
    //          log(`draggableCollage() 1 reset to: ${collageView1.draggableCollage()}`);
    //    ... I THINK THIS IS NOW
    //        collage.draggable(draggable)

  }

  // wrap our collage in the panel display
  createTabPanelComp() {
    const view = new SmartView({id: `view-${this.getTabId()}`, name: `view-${this.getTabName()}`, scene: this.collage});
    const comp = () => <ReactSmartView view={view}/>;
    return comp;
  }

}
