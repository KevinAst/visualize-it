import isEqual        from 'lodash.isequal';
import isFunction     from 'lodash.isfunction';
import isObject       from 'lodash.isobject';
import isPlainObject  from 'lodash.isplainobject';
import isString       from 'lodash.isstring';

//***
//*** various "internal" value-added isA functions
//***

// isClass(ref): alias to isFunction(ref) ... in JavaScript there is no real distinction between class/function
const isClass = isFunction;

// isNumber(ref): is ref a number?
function isNumber(ref) {
  return typeof ref === 'number';
}

// isBoolean(ref): is ref a boolean?
function isBoolean(ref) {
  return ref === true || ref === false;
}

// isArray(ref): alias to Array.isArray(ref)
const isArray = Array.isArray;

// isSmartObject(ref): is ref a SmartObject (a SmartModel derivation)
function isSmartObject(ref) {
  return ref && ref.isaSmartObject && ref.isaSmartObject();
}

// isPkg(ref): is ref a Pkg (SmartPkg)
function isPkg(ref) {
  return ref && ref.isaPkg && ref.isaPkg();
}

// isPkgEntry(ref): is ref a PkgEntry
function isPkgEntry(ref) {
  return ref && ref.isaPkgEntry && ref.isaPkgEntry();
}

// isEPkg(ref): is ref a EPkg
function isEPkg(ref) {
  return ref && ref.isaEPkg && ref.isaEPkg();
}

// isPkgTree(ref): is ref a PkgTree
function isPkgTree(ref) {
  return ref && ref.isRoot;
}

// isView(ref): is ref a View (SmartView)
function isView(ref) {
  return ref && ref.isaView && ref.isaView();
}

//***
//*** promote our isA utilities
//***

export {
  isEqual,       // + isEqual(ref1, ref2):  boolean ... a deep comparison AI: doesn't really belong in typeCheck, but hey
  isFunction,    // + isFunction(ref):      boolean
  isNumber,      // + isNumber(ref):        boolean
  isBoolean,     // + isBoolean(ref):       boolean
  isObject,      // + isObject(ref):        boolean
  isPlainObject, // + isPlainObject(ref):   boolean
  isArray,       // + isArray(ref):         boolean
  isString,      // + isString(ref):        boolean
  isClass,       // + isClass(ref):         boolean
  isSmartObject, // + isSmartObject(ref):   boolean
  isPkg,         // + isPkg(ref):           boolean
  isPkgEntry,    // + isPkgEntry(ref):      boolean
  isEPkg,        // + isEPkg(ref):          boolean
  isPkgTree,     // + isPkgTree(ref):       boolean
  isView,        // + isView(ref):          boolean
};
