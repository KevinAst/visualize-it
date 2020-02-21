import React          from 'react';
import ReactSmartView from 'util/ReactSmartView';

import TabController  from './TabController';

import DispMode       from 'core/DispMode';
import PseudoClass    from 'core/PseudoClass';
import SmartView      from 'core/SmartView';
import Scene          from 'core/Scene';

import verify         from 'util/verify';
import {isClass}      from 'util/typeCheck';


/**
 * TabControllerClass is a concrete class that manages a specific Class tab.
 */
export default class TabControllerClass extends TabController {

  /**
   * Create a TabControllerClass.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: compLibName/comp, or
   * systemName/view, etc.).
   *
   * @param {string} tabName the human interpretable name displayed in
   * the tab.
   *
   * @param {class} clazz the class being displayed/managed by this tab.
   */
  constructor(tabId, tabName, clazz) {
    super(tabId, tabName);

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId/tabName done by base class
    // ... clazz
    check(clazz,           'clazz is required');
    check(isClass(clazz),  'clazz must be a class type');

    // retain state specific to this derivation
    this.clazz = clazz;
  }

  // class's are NOT editable
  isEditable() {
    return false;
  }

  // manage DispMode settings (specific to class)
  setDispMode(dispMode) {
    super.setDispMode(dispMode);

    //***
    //*** value added logic:
    //***

    // ?? don't think there is anything to do here?
    // propagate setting into our object model
    if (dispMode === DispMode.edit) {
    }
    else if (dispMode === DispMode.view) {
    }
    else { // animate
    }

  }

  // wrap our class in the panel display
  createTabPanelComp() {

    // NOTE: Components visualization is very restricted
    //       - within the builder to simply verify it's visuals
    //       - an isolated read-only view
    //       Because of this, we simply piggy-back off the production
    //       code that supports a scene.
    //       - using the Scene, we merely
    //       - instantiate a single component in it
    //       - and mark it as a component render
    //         ... providing the distinction that this is a component view

    // instantiate a single component from self's class
    const compName = PseudoClass.getClassName(this.clazz);
    const comp     = new this.clazz({id: `comp-${compName}`}); // ?? hopefully these components don't need any other parameter context

    // wrap our single component in a scene (see NOTE above)
    const scene = new Scene({
      id: `view-${compName}`,
      comps: [comp], // 
      width:  300,   // ?? we need a way for the comp to tell us it's size
      height: 300,
    });

    // ?? somehow demark something as a read-only component

    // from this point, we can pick up with the normal SmartView logic
    const view = new SmartView({id: `view-${compName}`, scene});
    const panelComp = () => <ReactSmartView view={view}/>;
    return panelComp;
  }

}
