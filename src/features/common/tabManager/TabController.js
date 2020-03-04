import verify         from 'util/verify';
import {isString}     from 'util/typeCheck';

/**
 * TabController is an abstract base class that provides the API
 * through which the Tabs UI may interact with the visualize-it object
 * model.
 * 
 * Derivations of this class are created for each of the specific
 * top-level object types, rendered by a tab.
 */
export default class TabController {

  /**
   * Create a TabController.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: compLibName/comp, or
   * systemName/view, etc.).
   *
   * @param {string} tabName the human interpretable name displayed in
   * the tab.
   */
  constructor(tabId, tabName) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId
    check(tabId,              'tabId is required');
    check(isString(tabId),    'tabId must be a string');
    // ... tabName
    check(tabName,            'tabName is required');
    check(isString(tabName),  'tabName must be a string');

    // carve out our object state
    this.tabId   = tabId;
    this.tabName = tabName;
  }

  /**
   * Return self's tabId.
   * @returns {string} the tabId of self.
   */
  getTabId() {
    return this.tabId;
  }

  /**
   * Return self's tabName.
   * @returns {string} the tabName of self.
   */
  getTabName() {
    return this.tabName;
  }

  /**
   * Return the top-level object model targeted by this tab.
   * @returns {SmartObj} the target object rendered by this tab.
   */
  getTarget() {
    throw new Error(`***ERROR*** TabController.getTarget() the ${this.diagClassName()} class derivation MUST implement this abstract method (tabId:${this.tabId}, tabName:${this.tabName})!!`);
  }

  /**
   * Return the "no property" component that renders self in the tab panel.
   * @returns {ReactComp} the "no property" component that renders self in the tab panel.
   */
  getTabPanelComp() {
    // cache our TabPanelComp so as to prevent constant re-renders -and- heavy-weight Konva mounts
    if (!this.TabPanelComp) {
      this.TabPanelComp = this.createTabPanelComp();
    }
    return this.TabPanelComp;
  }


  /**
   * Create the "no property" component that renders self in the tab panel.
   * @returns {ReactComp} the "no property" component that renders self in the tab panel.
   */
  createTabPanelComp() {
    throw new Error(`***ERROR*** TabController.createTabPanelComp() the ${this.diagClassName()} class derivation MUST implement this abstract method (tabId:${this.tabId}, tabName:${this.tabName})!!`);
  }


  /**
   * Return self's "real" class name, used for diagnostic purposes
   * (such as logs and errors).  The name is unmangled (even in
   * production builds).
   *
   * @returns {string} self's "real" class name.
   */
  diagClassName() {
    return this.constructor.unmangledName || this.constructor.name;
  }
}
TabController.unmangledName = 'TabController';
