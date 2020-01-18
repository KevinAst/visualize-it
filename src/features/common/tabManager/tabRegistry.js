import React          from 'react';
import verify         from 'util/verify';
import {isString,
        isComponent}  from 'util/typeCheck';
import {createLogger} from 'util/logger';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** tabRegistry ... ').disable();


//***
//*** Our tabRegistry
//***

const tabRegistry = {
  // tabId: {
  //   tabName,
  //   tabCreator,
  // },
  // ...
};


/**
 * Register the supplied entry as a potential tab that can be rendered
 * in our system.
 *
 * @param {string} tabId a globally unique key, identifying the tab in
 * question. Typically a federated namespace is employed to insure
 * this key is globally unique (ex: compLibName/comp, or
 * systemName/view, etc.).
 *
 * @param {string} tabName the name displayed in the tab.
 *
 * @param {ReactComp} tabCreator a React Component that instantiates
 * the tab content without any additional context (in other words, it
 * will be instantiated without any attributes).
 */
export function registerTab(tabId, tabName, tabCreator) {

  log(`registerTab(tabId: '${tabId}', tabName: '${tabName}')`);

  // validate our parameters
  const check = verify.prefix('registerTab() parameter violation: ');

  // ... tabId
  check(tabId,               'tabId is required');
  check(isString(tabId),     'tabId must be a string, NOT: ', tabId);
  check(!tabRegistry[tabId], `tabId '${tabId}' has already been registered (it must be globally unique)`);

  // ... tabName
  check(tabName,           'tabName is required');
  check(isString(tabName), 'tabName must be a string, NOT: ', tabName);

  // ... tabCreator
  check(tabCreator,              'tabCreator is required');
  check(isComponent(tabCreator), 'tabCreator must be a React Component, NOT: ', tabCreator);

  // register this tab entry
  tabRegistry[tabId] = {
    tabName,
    tabCreator,
  };
}


/**
 * Return the tabName registered to the supplied `tabId`.
 *
 * @param {string} tabId the registered entry identifier.
 *
 * @returns {string} the registered tabName ('UNKNOWN' for unregistered tab).
 */
export function getTabName(tabId) {
  const tab = tabRegistry[tabId];
  return tab ? tab.tabName : 'UNKNOWN';
}


/**
 * Return the tabCreator ReactComp registered to the supplied `tabId`.
 *
 * @param {string} tabId the registered entry identifier.
 *
 * @returns {ReactComp} the registered tabCreator ReactComp.
 * When NOT registered, a fallback component rendering:
 * "UNKNOWN Tab: {tabId} ... missing Tab Registration :-("
 */
export function getTabCreator(tabId) {
  const tab = tabRegistry[tabId];
  return tab ? tab.tabCreator : () => <span>UNKNOWN Tab: {tabId} ... missing Tab Registration :-(</span>;
}
