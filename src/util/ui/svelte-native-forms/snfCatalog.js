const _catalog = new Map();
let   _nextKey = 1;

/**
 * Register (i.e. catalog) the supplied resource returning a generated
 * unique "prefixed" key.
 *
 * @param {string} prefix - a prefix to include in the generated key
 * (commonly used to identify type).
 *
 * @param {any} resource - the resource to catalog (typically a
 * FormChecker/FieldChecker object instance).
 *
 * @returns {string} a unique key, incorporating the supplied prefix.
 */
export function register(prefix, resource) {
  const key = `${prefix}-${_nextKey++}`;
  _catalog.set(key, resource);
  // console.log(`XX register: '${key}'`);
  return key;
}

/**
 * Unregister (i.e. uncatalog) the resource identified by the supplied
 * key.
 *
 * @param {string} key - the key identifying the entry to remove.
 */
export function unregister(key) {
  const success = _catalog.delete(key);
  // console.log(`XX unregister: '${key}' ... success: ${success}`);
}

/**
 * Return the resource identified by the supplied key (undefined for
 * none).
 *
 * @param {string} key - the key identifying the entry to fetch.
 *
 * @param {any} resource - the resource to catalog (typically a
 * FormChecker/FieldChecker object instance).
 *
 * @returns {any} the resource associated to the supplied key
 * (undefined for none).
 */
export function get(key) {
  return _catalog.get(key);
}
