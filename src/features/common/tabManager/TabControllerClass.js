import React                from 'react';
import ReactSmartView       from 'util/ReactSmartView';

import TabController        from './TabController';

import PseudoClass          from 'core/PseudoClass';
import SmartView            from 'core/SmartView';
import Scene                from 'core/Scene';
import {containerSizeFudge} from 'core/konvaUtil';

import verify               from 'util/verify';
import {isClass}            from 'util/typeCheck';


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
  constructor(tabId, tabName, clazz, smartPkg) {
    super(tabId, tabName);

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId/tabName done by base class
    // ... clazz
    check(clazz,           'clazz is required');
    check(isClass(clazz),  'clazz must be a class type');

    // retain state specific to this derivation
    this.clazz = clazz; // ... doesn't appear to be used (hmmmm)

    // NOTE: Components visualization is very restricted
    //       - within the builder to simply verify it's visuals
    //       - an isolated read-only view
    //       Because of this, we simply piggy-back off the production
    //       code that supports a scene.
    //       - using the Scene, we merely
    //       - instantiate a single component in it
    //       - the component API determines if it is editable
    //         ... see: canHandleDispMode(dispMode): boolean

    // instantiate a single component from self's class
    // ... this is what we will render in our tab :-)
    this.compName = PseudoClass.getClassName(clazz);
    this.comp     = new clazz({id: `comp-${this.compName}`, // I think we are OK ... hopefully no other param context is needed
                               x:  containerSizeFudge,
                               y:  containerSizeFudge});

    // wrap our single component in a scene (see NOTE above)
    this.scene = new Scene({
      id: `view-${this.compName}`,
      comps: [this.comp],
    });

    this.scene.setParent(smartPkg); // ??!! hook up our parentage properly ... simulating what would happen in a real pkg
  }

  // our target is our component instance, instantiated by self's class
  getTarget() {
    return this.comp;
  }

  // wrap our class in the panel display
  createTabPanelComp() {
    const view = new SmartView({id: `view-${this.compName}`, scene: this.scene});
    const panelComp = () => <ReactSmartView view={view}/>;
    return panelComp;
  }

}
