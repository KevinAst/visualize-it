import verify            from 'util/verify';
import {isString,
        isClass,
        isObject,
        isPlainObject}   from 'util/typeCheck';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * SmartModel is the abstract top-level base class for all visualize-it
 * objects.  A consistent interpretation is defined for:
 *  - id/name
 *  - various common APIs
 *    * ?? expand
 *  - various common utilities
 *    * ?? expand
 */
export default class SmartModel {

  /**
   * Create a SmartModel.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this object.
   * @param {string} [name=id] - the human interpretable name of this
   * object (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   */
  constructor({id, name, ...unknownArgs}={}) {

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');

    // ... name
    if (name) {
      check(isString(name), 'name (when supplied) must be a string');
    }

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.id   = id;
    this.name = name || id;
  }


  /**
   * An instance method that transforms self (with depth) into
   * smartJSON.
   * 
   * NOTE: The algorithm for this utility is fully implemented here
   *       (the SmartModel base class), with the polymorphic knowledge
   *       of which properties should be encoded (see getEncodingProps(),
   *       and rarely needs to be overwritten.
   *
   * REMEMBER: `this` is an object instance of SmartModel,  because we are an
   *           instance method.  In other words, this method is only handling
   *           SmartModel types (NOT primitives, etc.)
   *           As a result, we will end up with a JSON structure like this:
   *             const myJSON: { // we are striving for THIS
   *               smartType:  '??SYNC THIS',
   *               prop1: 'hello',
   *               prop2: {...smartObj...},
   *               comps: [
   *                 {...smartObj...},
   *                 {...smartObj...},
   *               ]
   *             }
   *
   * @returns {smartJSON} the smartJSON representation of self.
   */
  toSmartJSON() {

    // encode our type information
    // ... these methods take into account BOTH real types/classes AND pseudoClasses
    const myJSON = {
      smartType: this.getMyClassName(),
      smartLib:  this.getMyLibName(),
    };

    // encode our instance properties
    const encodingProps = this.getEncodingProps();
    encodingProps.forEach( (propName) => {
      let propValue = this[propName];
      // encode SmartModel objects
      if (propValue.toSmartJSON) { // we cheat and do a duck type check here :-)
        propValue = propValue.toSmartJSON();
      }
      // encode arrays, by encoding all array items
      else if (Array.isArray(propValue)) { 
        propValue = propValue.map( item => item.toSmartJSON ? item.toSmartJSON() : item );
      }
      // NOTE: all other types pass-through as-is
      //       ... this supports primitive types (string, number, etc.) 
      //       ... TODO: may be too permissive for other things (like other NON SmartModel objects
      //                 - should we throw an exception if this is isObject()
      //                 - should we allow isPlainObject to pass through as-is?
      //                 - we could auto-handle things like Date, etc.
      //                   - OR more generically leverage any object that has the toJSON() method
      //                     ... is this guaranteed to work when instantiating content with Date()
      //                     ... certainly would be a special case as IT would NOT work with namedProps (hmmmm)
      myJSON[propName] = propValue;
    });

    // beam me up Scotty :-)
    return myJSON;
  }

  // ?? document
  // ?? an instance method returning the class name of self (interpreting pseudoClasses too)
  getMyClassName() {
    if (this.pseudoClass && this.pseudoClass.isInstance() ) { // a pseudoClass instance
      return this.pseudoClass.id;
    }
    return this.constructor.name; // standard JS class function name
  }

  // ?? document
  // ?? a static method returning the class name of the supplied classRef (interpreting pseudoClasses too)
  static getClassName(classRef) {
    if (classRef.pseudoClass && classRef.pseudoClass.isType() ) { // a pseudo class (an object instance to be cloned)
      return classRef.id;
    }
    return classRef.name; // standard JS class function name
  }

  // ?? document
  getMyLibName() {
    return 'TODO'; // ?? temp for now
  }

  /**
   * Polymorphically reveal self's properties that are used to
   * encode smartJSON.
   * 
   * With this knowledge, toSmartJSON() can be fully implemented at
   * the SmartModel class (and rarely need to be overwritten).
   * 
   * Sub-Classes can accumulate their properties by including their
   * parent classes, as follows:
   *
   *   ```js
   *   class MyClass extends SmartModel {
   *     getEncodingProps(): {
   *       return [...super.getEncodingProps(), ...['my', 'props', 'too']];
   *     }
   *     ...
   *   }
   *   ```
   * 
   * Background: NOT ALL object properties should be encoded to retain
   * a persistent state.  As an example, temporal working state (such
   * as mounted visuals) can and should be re-constituted from logic,
   * NOT from a persistent state.
   *
   * @returns {string[]} self's property names that need to be encoded
   * in our smartJSON representation.
   */
  getEncodingProps() {
    return ['id', 'name'];
  }

  /**
   * A static method that reconstitutes class-based objects (with
   * depth) from smartJSON.  By class-based objects we mean it will have
   * all the behavior (i.e. methods and state) of the original object.
   *
   * @param {JSON} smartJSON - the smartJSON structure representing
   * the object(s) to create.
   *
   * @returns {smartObject} a newly instantiated class-based object
   * from the supplied smartJSON.
   */
  static fromSmartJSON(smartJSON) {
    return fromSmartJSON(smartJSON);
  }


  /**
   * A cloning method that creates a deep copy of self.
   *
   * @param {ObjectLiteral} [namedProps] - The optional named
   * properties that when supplied will override the members of self
   * that are to be deeply cloned).
   *
   * @returns {smartObject} a deep copy of self.
   */
  smartClone(overridingNamedProps={}) {

    // clone our instance properties members by recursively drilling into smartClone() as needed
    // ... handling arrays and object literals too
    const encodingProps = this.getEncodingProps(); // ??$$$ refactor this to be used by clone/encoding ?? do NOT call encoding (anywhere) USE instanceProps or memberProps
    const clonedProps = {};
    encodingProps.forEach( (instanceName) => {
      const instanceValue = this[instanceName]; // self's instance member
      let   clonedValue   = undefined;          // resolved below

      // defer to supplied override (when defined)
      if (overridingNamedProps[instanceName]) {
        clonedValue = 'placeholder';; // DEFENSIVE: use placeholder, resolved later (supporting overrides that are NOT part of our instance members)
      }

      // otherwise (when not overridden) deeply clone our instance value
      else {

        // clone SmartModel objects
        if (instanceValue.smartClone) { // ... using a duck type check
          clonedValue = instanceValue.smartClone();
        }

        // clone arrays, by cloning all array items
        else if (Array.isArray(instanceValue)) {
          clonedValue = instanceValue.map( item => item.smartClone ? item.smartClone() : item ); // ?? L8TR: for item: encapsulate reusable function to handle all types (as above/below)
        }

        // for NON SmartModel objects
        else if (isObject(instanceValue)) {

          // we support plain objects
          if (isPlainObject(instanceValue)) {
            clonedValue = Object.entries(instanceValue).reduce( (accum, [key, value]) => {
              accum[key] = value.smartClone ? value.smartClone() : value; // ?? L8TR: for value: encapsulate reusable function to handle all types (as above/below)
              return accum;
            }, {} );
          }

          // all other objects are a problem
          // ... CONSIDER (as needed) adding support for common objects like Date, etc
          //     OR more generically leverage any object that has the toJSON() method
          else {
            throw new Error(`***ERROR*** SmartModel.smartClone() processing object (of type ${this.constructor.name}) whose member object (of type ${instanceValue.constructor.name}) is NOT supported ... do NOT know how to clone member object :-(`);
          }
        }

        // all other types pass-through as-is, supporting primitive types (string, number, etc.) 
        else {
          clonedValue = instanceValue;
        }
      }

      // maintain our running clonedProps
      clonedProps[instanceName] = clonedValue;

    });
    
    // instantiate a new copy of self (our cloned copy)
    const namedProps = {...clonedProps, ...overridingNamedProps}; // DEFENSIVE: overridingNamedProps take precedence -and- support overrides that are NOT part of our instance members
    const clonedCopy = new this.constructor(namedProps);          // NOTE: our entire cloning and persistance architecture is based on SmartModel constructors using named parameters!

    // that's all folks :-)
    return clonedCopy;
  }

  /**
   * A static method that serves as a constructor to create
   * smartObjects (SmartModel derivations).
   *
   * @param {classRef} classRef - the class representing the object to
   * create, either:
   * - a real class of type SmartModel whose constructor supports
   *   namedProps
   * - or a pseudoClass ... an object instance that logically
   *   represents a class
   *
   * @param {ObjectLiteral} namedProps - The named properties used to
   * passed into the constructor.
   *
   * @returns {smartObject} a newly instantiated class-based object
   * of type `classRef` initialized with `namedProps`.
   */
  static createSmartObject(classRef, namedProps) {

    // handle a standard class definition
    if (isClass(classRef)) { // ??$$ DONE: alias this to: ... isClass(classRef)
      console.log(`?? ***INFO** SmartModel.createSmartObject() creating standard class: '${SmartModel.getClassName(classRef)}' ... using namedProps: `, namedProps);
      return new classRef(namedProps);
    }

    // handle a pseudoClass (an object that is considered a dynamic class to be instantiated)
    else if (classRef.pseudoClass && classRef.pseudoClass.isType()) {

      // clone the pseudoClass (with depth), overriding supplied namedProps
      const newObj = classRef.smartClone(namedProps);

      // mark the cloned object as an instance (NOT a type)
      newObj.pseudoClass.id   = classRef.id;
      newObj.pseudoClass.name = `a pseudoClass instance of type: '${classRef.id}'`; // for good measure
      console.log(`?? ***INFO** SmartModel.createSmartObject() created pseudoClass: '${SmartModel.getClassName(classRef)}' ... `, {namedProps, newObj});
      return newObj;

      // ?? TRASH BELOW
      //? // ?? return classRef.clone(namedProps); // implement this too ... kinda a clone with namedProps override
      //? // ?? not sure what to call it >>> call it smartClone(overriddenNamedProps={}): smartObject
      //? //      ... NO NO NO: it is DIFFERENT than clone() ... it is a constructor NO NO NO: we are the constructor
      //? //          NO NO NO: it doesn't have any depth (everything is supplied in the namedProps
      //? //      >>> KEY: here is what we want to do:
      //? //           x   1. also check that classRef.pseudoClass.isType() (above)
      //? //           x   2. instantiate the underlying class (i.e. classRef.constructor WITH params
      //? //                  ... will we be given all the params needed?
      //? //                  >>> NOT: this is what we must clone ... and NOTE: should NOT hit any pseudoClass "TYPE", rather ALL pseudoClass "INSTANCES"
      //? // KEY KEY KEY               SO: I think we are back to clone has NO special case of pseudoClass because ALL pseudoClasses should be instances
      //? //                               WHAT WE NEED TO DO:
      //? //                               a. clone the object (with depth) however override the namedProps 
      //? //                                  classRef.smartClone(namedProps);
      //? //                               b. 
      //? //                               c. 
      //? //                               d. 
      //? //                               e. 
      //? //                               f. 
      //? //           x   3. force the newObj.pseudoClass.id to be: classRef.id
      //? //      >>> CONFUSING: NOT RIGHT
      //? //          - THE ONLY DIFF IS: when it sees a pseudoClass TYPE it construct
      //? //          - consider: pseudoConstruct()? ... it's really private (don't want to call it outside of THIS method)
      //? //      QUESTION: a scene that 
      //? 
      //? // NOTE: we can't intermix our json solution with the clone as it is an infinite recursion (when pseudoClass construction is involved)
      //? //       ... i.e. we are in the middle of our JSONization and all of a sudden we have to "construct" a pseudoClass which clones it.
      //? //    HOW? ... return SmartModel.fromSmartJSON( this.toSmartJSON() );
      //? //? // HERE IT IS QUICK AND DIRTY: ?? NOTE: classRef is really `this`
      //? //? const newObj = SmartModel.fromSmartJSON( classRef.toSmartJSON() );
      //? //? for (const key in namedProps) {
      //? //?   const val = namedProps[key];
      //? //?   newObj[key] = val; // override namedProps in new object
      //? //? }
      //? //? return newObj;
      //? 
      //? // ?? SEE IT WORK ...
      //? // cannot import Scene: ReferenceError: Cannot access 'SmartModel' before initialization
      //? // return new Scene({...
      //? // use the class in classRef ... which is a Scene
      //? return new classRef.constructor({ // use the Scene() constructor ... this is the only type that is pseudo constructed yet
      //?   id: 'scenePoop',
      //?   comps: [
      //?     // new generalComps.Valve1({id: 'myValve1'}),
      //?     // new generalComps.Valve2({id: 'myValve2'}),
      //?     // new generalComps.Valve3({id: 'myValve3'}),
      //?     // new ToggleDraggableScenesButton1(),
      //?   ],
      //?   width:  19, // ... see this setting pass through our process
      //?   height: 56,
      //? });
    }

    // otherwise, could NOT interpret the supplied classRef
    else {
      const errMsg = `***ERROR*** SmartModel.createSmartObject(classRef, namedProps): invalid classRef parameter ... must be a JS Class or a PseudoClass (an object instance to be cloned) ... see logs for parameters`
      console.error(errMsg, {classRef, namedProps});
      throw new Error(errMsg);
    }
  }

} // end of ... SmartModel class


//******************************************************************************
//*** Specifications:
//******************************************************************************

/**
 * @typedef {Object} smartObject
 *
 * smartObject is an object instance that is a SmartModel derivation.  It
 * has the following characteristics:
 *
 * - The class constructor employs namedProps.  This is KEY aspect to
 *   make persistance work, because it supports data-driven injection
 *   from smartJSON.
 *
 * - ?? more
 */


/**
 * @typedef {JSON} smartJSON
 * 
 * smartJSON is a self-contained JSON structure that can be
 * re-constituted back into a class-based object representation.
 * 
 * - it supports object containment (i.e. objects with depth),
 *   supporting an entire object tree
 * 
 * - it is used for BOTH persistence and functional state management
 *   (i.e. redux).
 * 
 * - it is created by:
 *   ```
 *   SmartModel.prototype.toSmartJSON()
 *   ```
 * 
 * - it is used to reconstitute class-based objects, via:
 *   ```
 *   SmartModel.fromSmartJSON(smartJSON)
 *   ```
 */

/**
 * @typedef {ref} classRef
 * 
 * classRef is a class (physically or logically) that can be
 * instantiated.  It can either be:
 *
 *  - a real class ... of type SmartModel whose constructor supports
 *    namedProps,
 * 
 *  - or a pseudoClass ... an object instance that logically
 *    represents a class.  These are resource-based objects that can
 *    be dynamically edited (through the graphical editor), and yet
 *    can be "instantiated" as items of other objects!  Please refer
 *    to PseudoClass.
 */

/**
 * @typedef {ref} ObjectLiteral
 * 
 * A nomenclature that symbolizes a type which is an object literal,
 * such as `{a: 1, b: 2}` used in JSON structures, namedProps, etc.
 */
const ObjectLiteral = 'ObjectLiteral';



//******************************************************************************
//*** Private Object Creation/JSONization Helpers
//******************************************************************************

// The SmartModel.fromSmartJSON() implementation ... see JavaDocs (above)
function fromSmartJSON(smartJSON) { // ?? consider just implementing this in the static class

  // NOTE: We don't validate any characteristic of our supplied smartJSON,
  //       because the way in which this algorithm is invoked (recursively),
  //       it can truly be ANY type of data!
  
  // process array types by recursively transforming each item
  if (Array.isArray(smartJSON)) {
    //?? debugger;
    return smartJSON.map( item => fromSmartJSON(item) );
  }

  // process JSON objects by translating them into real class-based objects
  // NOTE: This is a "critical" part of our logic, where we interpret classRef, etc.
  //       ... this logic handles BOTH:
  //            - smart objects ..... i.e. SmartModel derivations
  //            - object literals ... {a: 1, b: smartObj}
  if (isPlainObject(smartJSON)) {

    //?? debugger;

    // determine the classRef (could be a real class or a pseudoClass)
    const classRef = getClassRefFromSmartJSON(smartJSON);

    // define our namedProps to feed into our constructor (from smartJSON),
    // recursively resolving each ref into real class-based objects
    const namedProps = {};
    for (const key in smartJSON) {
      const val = smartJSON[key];

      // bypass selected keywords that are NOT part of the constructor namedProps
      if (key === 'smartType' || key === 'smartLib') { // type info is for decoding only
        continue;
      }

      // recursively resolve each val into a real class-based object
      //?? debugger;
      namedProps[key] = fromSmartJSON(val);
    }

    // when the smartJSON is a plain object literal,
    // ... we can simply return the namedProps as-is because:
    //     - it has been newly carved out
    //     - and it's prop references have been resolved into appropriate objects as needed
    if (classRef === ObjectLiteral) {
      return namedProps;
    }

    // otherwise our smartJSON represents a true smart object (SmartModel derivation)
    // ... instantiate a real class-based object using our value-added constructor
    // ... that handles real classes and pseudoClasses
    else {
      return SmartModel.createSmartObject(classRef, namedProps);
    }
  }

  // all other types are assumed to be immutable primitives, and simply passed through :-)
  // ... string, number, etc.
  return smartJSON;
}

// + getClassRefFromSmartJSON(smartJSON): classRef
//   ... currently private
//   ... if needed can expose as static method
function getClassRefFromSmartJSON(smartJSON) {

  // handle JSON that is NOT a smart object (SmartModel) as an ObjectLiteral
  if (!smartJSON.smartType) {
    return ObjectLiteral;
  }

  const className = smartJSON.smartType;
//const libName   = 'L8TR'; // ?? L8TR: smartJSON.smartLib;

  // resolve our classRef
  //const classRef = libManager.getClassRef(libName, className); // TODO: ?? eventually this is a lookup in our libManager, but till we have this in place we hard-code a catalog
  const classRef = temporaryLibManagerHACK[className];

  // error out if we can't resolve our classRef ... ?? really should prob error out in libManager.getClassRef()
  if (!classRef) {
    const errMsg = `***ERROR*** SmartModel.getClassRefFromSmartJSON(smartJSON): could not resolve a classRef from className: '${className}' ... see logs for smartJson `;
    console.error(errMsg, smartJSON);
    throw new Error(errMsg);
  }
  
  return classRef;
}

// TODO: eventually this is a lookup in our libManager, but till we have this in place we hard-code a catalog
//       exported to support external registration ... temporaryLibManagerHACK['MyClass'] = MyClass;
export const temporaryLibManagerHACK = {
  // initialized in src/features/sandbox/konvaSandbox/sceneView1.js to avoid circular imports
//?   Collage,
//?   PseudoClass,
//?   Scene,
//?   SmartComp,
//?   SmartScene,
//?   SmartView,
};
