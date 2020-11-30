/**
 * Locate the ancestor of `elm` (inclusive) that defines the supplied
 * `cssClass`.
 *
 * @param {DOMElement} elm - the seed DOM element from which to
 * traverse it's ancestry.
 * @param {string} cssClass - the CSS class name to search for.
 *
 * @returns {DOMElement} the ancestor DOM element (inclusive)
 * satisfying our criteria (`undefined` for not found).
 */
export function findAncestorWithCssClass(elm, cssClass) {

  // if elm has desired cssClass, we found it!
  if (elm.classList.contains(cssClass)) {
    return elm;
  }

  // recurse further up our DOM ancestry
  const parent = elm.parentElement;
  return parent ? findAncestorWithCssClass(parent, cssClass) : undefined;
}
