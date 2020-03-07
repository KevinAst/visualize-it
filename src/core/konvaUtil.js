//***
//*** Various Konva utils
//***

/**
 * Return the supplied node's ancestor that is in the top-level Layer.
 */
export function ancestorOfLayer(node) {
  const parentNode = node.getParent();
  return parentNode.getClassName() === 'Layer' ? node : ancestorOfLayer(parentNode);
}
