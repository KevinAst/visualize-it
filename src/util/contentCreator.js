/**
 * Create content of the registered type, using the supplied context.
 *
 * @param {string} contentType the unique contentType previously registered.
 * @param {any} contentContext the context of this specific type,
 * passed to the registered function.
 */
export function createContent(contentType, contentContext) {
  // ?? validate
  return _contentCreatorCatalog[contentType](contentContext);
}


/**
 * Register a creator of content.
 *
 * @param {string} contentType the unique contentType that catalogs
 * this entry.
 * @param {function} contentCreatorFn the function capable of
 * creating content of this type.
 * API: createContentFn(contentContext): content
 */
export function registerContentCreator(contentType, contentCreatorFn) {
  // ?? validate
  _contentCreatorCatalog[contentType] = contentCreatorFn;
}

// our registered catalog of contentCreatorFns
const _contentCreatorCatalog = {
  // contentType: contentCreatorFn(contentContext)
};
