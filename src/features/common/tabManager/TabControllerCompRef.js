import React                from 'react';
import ReactSmartView       from 'util/ReactSmartView';

import TabController        from './TabController';

import SmartView            from 'core/SmartView';
import CompRef              from 'core/CompRef';

import verify               from 'util/verify';

/**
 * TabControllerCompRef is a concrete class that manages a specific component tab.
 */
export default class TabControllerCompRef extends TabController {

  /**
   * Create a TabControllerCompRef.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: compLibName/comp, or
   * systemName/view, etc.).
   *
   * @param {string} tabName the human interpretable name displayed in
   * the tab.
   *
   * @param {CompRef} compRef the component class being displayed/managed by this tab.
   */
  constructor(tabId, tabName, compRef) {

    super(tabId, tabName);

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId/tabName done by base class
    // ... compRef
    check(compRef,                     'compRef is required');
    check(compRef instanceof CompRef,  'compRef must be a CompRef type');

    // retain state specific to this derivation
    this.compRef = compRef;
  }

  // our target is our component instance, maintained in CompRef
  getTarget() {
    return this.compRef.getCompInstance();
  }

  // wrap our class in the panel display
  createTabPanelComp() {
    const view = new SmartView({id: `view-${this.compRef.getId()}`, pallet: this.compRef});
    const panelComp = () => <ReactSmartView view={view}/>;
    return panelComp;
  }

}
