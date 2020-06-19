import verify      from '../util/verify';
import {isString}  from '../util/typeCheck';

/**
 * TabController is an abstract base class that provides the API
 * through which the Tabs UI interacts with an app-specific object
 * model.
 * 
 * Derivations of this class are created for app-specific object types
 * rendered by a tab.
 */
export default class TabController {

  /**
   * Create a TabController.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: pkgName/scene).
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
   * Return self's qualifying description (for example, the Pkg name
   * of a PkgEntry).  This is used (in one case) to supplement/qualify
   * the active tab in the AppBar.  So in this example, it helps to
   * qualify two PkgEntries with the same name in different packages.
   *
   * This is an abstract method that must be implemented by the class
   * derivations.
   *
   * @returns {string} self's qualifying supplemental description
   */
  getTabQualifyingDesc() {
    throw new Error(`***ERROR*** TabController.getTabQualifyingDesc() the ${this.diagClassName()} class derivation MUST implement this abstract method (tabId: ${this.tabId}, tabName: ${this.tabName})!!`);
  }

  /**
   * The tabActivated() method is invoked whenever this tab is
   * activated.  By default, it does nothing, but it can be overridden
   * in various derivations to perform app-specific logic.
   */
  tabActivated() {
  }

  /**
   * Return the app-specific object targeted by this tab.
   *
   * This is an abstract method that must be implemented by the class
   * derivations.
   *
   * @returns {any} the app-specific object targeted by this tab.
   */
  getTabContext() {
    throw new Error(`***ERROR*** TabController.getTabContext() the ${this.diagClassName()} class derivation MUST implement this abstract method (tabId: ${this.tabId}, tabName: ${this.tabName})!!`);
  }

  /**
   * Return the component to be rendered in the tab panel.
   *
   * This is an abstract method that must be implemented by the class
   * derivations.
   *
   * @returns {{Comp, props}} the Comp class (and optional props) to
   * be rendered in the tab panel.
   */
  getTabPanel() {
    throw new Error(`***ERROR*** TabController.getTabPanel() the ${this.diagClassName()} class derivation MUST implement this abstract method (tabId: ${this.tabId}, tabName: ${this.tabName})!!`);
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
