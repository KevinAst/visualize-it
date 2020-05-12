/**
 * Escape all regular expression special characters.
 * 
 * Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 * 
 * @param {string} str the string to escape.
 * 
 * @return {string} the newly escaped string, representing the
 * supplied `str`.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Replace all occurrences of `find` with `replace` in the supplied
 * `str`.
 * 
 * @param {string} str the string to operate on.
 * @param {string} find the "from" string to be replaced.  Note that
 * all regular expression special characters are escaped.
 * @param {string} replace the "to" string to replace.
 * 
 * @return {string} the newly replaced string.
 */
export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
