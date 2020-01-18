import isEqual        from 'lodash.isequal';
import isFunction     from 'lodash.isfunction';
import isObject       from 'lodash.isobject';
import isPlainObject  from 'lodash.isplainobject';
import isString       from 'lodash.isstring';
import {isValidElementType} from 'react-is';

// alias to isFunction
const  isClass        = isFunction;

// return an indicator as to whether the supplied parameter is a 
// react component (true) or not (false).
function isComponent(comp) {
  // NOTE: our unit test checks all three forms of Component creation:
  //       - Stateless Functional Component
  //       - Class Component (extending from React.Component)
  //       - Legacy React.createClass()
  return isValidElementType(comp); 
}

export {
  isEqual,                    // + isEqual(ref1, ref2): boolean ... a deep comparison
  isFunction,                 // + isFunction(ref): boolean
  isObject,                   // + isObject(ref): boolean
  isPlainObject,              // + isPlainObject(ref): boolean
  isString,                   // + isString(ref): boolean
  isClass,                    // + isClass(ref): boolean
  isComponent,                // + isComponent(ref): boolean
};
