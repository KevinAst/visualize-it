import verify            from 'util/verify';
import {isString,
        isObject,
        isPlainObject}   from 'util/typeCheck';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import pkgManager        from './pkgManager';
import PseudoClass       from './PseudoClass';

/**
 * SmartModel is the abstract top-level base class for all visualize-it
 * objects. 
 *
 * SmartModel derivations are referred to as "smartObjects".  They
 * have the following characteristics:
 *
 * - The class constructor employs namedProps.  This is KEY aspect to
 *   make persistence work, because it supports data-driven injection
 *   from smartJSON.
 *
 * The SmartModel base class provides a consistency in:
 *
 *  - identification (id/name)
 *
 *  - persistance and state management:
 *    + toSmartJSON():smartJSON ................. transforms self (with depth) into smartJSON
 *<S> + fromSmartJSON(smartJSON): smartObject ... reconstitutes class-based objects (with depth) from smartJSON
 *    + getEncodingProps(): string[] ............ polymorphically expose properties required to encode self
 *    + smartClone(): smartObject ............... creates a deep copy of self
 *
 *  - various common utilities:
 *    ??? most replaced with new SmartClassRef
 *<S> + createSmartObject(classRef, namedProps): smartObject .. a value-added constructor
 *<S> + getClassName(classRef): string ........................ get class name of classRef (either a class or pseudoClass)
 *    + getMyClassName(): string .............................. get class name of self (interpreting BOTH class or pseudoClass)
 *    + getMyClassPkgName(): string ........................... get package name of self
 *<S> + isClass(classRef): boolean ............................ is supplied classRef a real class
 *<S> + isPseudoClass(classRef): boolean ...................... is supplied classRef a pseudoClass
 *
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
    const check = verify.prefix(`${this.getMyClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

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
   * NOTE: This algorithm is fully implemented within the SmartModel
   *       base class.  With the polymorphic knowledge of which
   *       properties to encode (see getEncodingProps()) it rarely
   *       needs to be overwritten.
   *
   * REMEMBER: `this` is an object instance of SmartModel (because this is an
   *           instance method).  In other words, this method only handles
   *           SmartModel types (NOT primitives, or other objects, etc.)
   *           As a result, the resulting JSON follows this pattern:
   *
   *           - the master definition of the BoilerScene pseudoClass (a type: Scene)
   *             ```js
   *               {
   *                 smartType: 'Scene',
   *                 smartPkg:  'core',
   *                 id:        'BoilerScene',
   *                 name:      'A Scene focused on the boiler components of our system',
   *                 _size:     {width: 300, height: 250},
   *                 comps: [
   *                   {...smartObj...},
   *                   {...smartObj...},
   *                 ],
   *               }
   *             ```
   *
   *           - an instance of the BoilerScene pseudoClass (a type: BoilerScene)
   *             ```js
   *               {
   *                 smartType: 'BoilerScene',
   *                 smartPkg:  'ACME',
   *                 id:        'BoilerScene',
   *                 name:      'A Scene focused on the boiler components of our system',
   *                 _size:     {width: 300, height: 250},
   *                 .... NOTE: all other members are re-constituted from the master definition
   *                            ... i.e. the pseudoClass
   *               }
   *             ```
   *
   * @returns {smartJSON} the smartJSON representation of self.
   */
  toSmartJSON() {

    // prime our JSON by encoding our smart type information
    // ... these methods take into account BOTH real types/classes AND pseudoClasses
    const myJSON = {
      smartType: this.getMyClassName(),
      smartPkg:  this.getMyClassPkgName(),
    };

    // demark the pseudoClass MASTERs in our JSON, so they can be hydrated early
    // ... see SmartPkg.fromSmartJSON()
    if (PseudoClass.isPseudoClassMaster(this)) {
      myJSON.isPseudoClassMaster = true;
    }

    // encode self's instance properties
    const encodingProps = this.getEncodingProps(); // $FOLLOW-UP$: refine getEncodingProps() to support BOTH persistence (toSmartJSON()) -AND- pseudoClass construction (smartClone())
    encodingProps.forEach( (propName) => {
      myJSON[propName] = encodeRef(this[propName]); // accumulate our running JSON structure
    });

    // beam me up Scotty :-)
    return myJSON;


    // internal function that encodes the supplied `ref` into JSON.
    // - this algorithm is needed to support additional types over and
    //   above smartObjs
    // - the algorithm is recursive, picking up all sub-references
    //   (with depth)
    // - ALL data types are handled (EXCEPT for class-based objects
    //   that are NOT smartObjs):
    //   * arrays
    //   * plain objects (as in object literals)
    //   * smartObjs (class-based object derivations of SmartModel)
    //   * primitives (string, number, boolean, etc.)
    //   * NOT SUPPORTED: class-based objects that are NOT smartObjs
    function encodeRef(ref) {

      // handle NO ref
      // ... simply pass it through (null, undefined, etc. ... even false is OK :-)
      if (!ref) {
        return ref;
      }

      // handle arrays ... simply encode all array items
      else if (Array.isArray(ref)) {
        const  arrayJSON = ref.map( item => encodeRef(item) );
        return arrayJSON;
      }

      // handle objects
      // ... various object types (see below)
      else if (isObject(ref)) {
        
        // handle smartObjs (class-based object derivations of SmartModel)
        if (ref instanceof SmartModel) {
          return ref.toSmartJSON();
        }

        // handle plain objects
        // ... simply encode each item WITHOUT the smartObj connotation
        else if (isPlainObject(ref)) {
          const plainObjJSON = Object.entries(ref).reduce( (accum, [subRefName, subRef]) => {
            accum[subRefName] = encodeRef(subRef);
            return accum;
          }, {} );
          return plainObjJSON;
        }

        // UNSUPPORTED: class-based objects that are NOT smartObjs
        // ... CONSIDER (as needed) adding support for common objects like Date, etc
        //     OR more generically leverage any object that has the toJSON() method
        else {
          throw new Error(`***ERROR*** SmartModel.toSmartJSON() processing ref object of type ${ref.constructor.name} is NOT supported ... only SmartModel derivations support the smartJSON format :-(`);
        }

      }

      // handle primitives (string, number, boolean, etc.)
      // ... simply pas-through as-is
      else {
        return ref;
      }

    } // end of ... encodeRef(ref)

  }


  /**
   * Return the classRef from which self was created.
   *
   * This is a meta object that accommodates type/class information
   * for ALL smartObjects, unifying both real classes and pseudo
   * classes!
   *
   * @returns {SmartClassRef} the classRef from which self was
   * created.
   */
  getClassRef() {

    // validation checks
    // ... we use plain `this.constructor.name`, even though it may be mangled in production build
    //     to avoid reliance on the value-added classRef we are accessing "in this method" :-)
    const check = verify.prefix(`${this.constructor.name}.getClassRef() id:'${this.id}', name:'${this.name}') ... `);

    // interpret pseudoClass instances
    // ... once again, we interpret this structure directly
    //     to avoid reliance on the value-added classRef we are accessing "in this method" :-)
    if (this.pseudoClass && this.pseudoClass.isInstance() ) {

      // the pseudoClass master (it's type) is maintained by the pseudo constructor
      // ... see: SmartClassRef.createSmartObject(namedParams)
      const pseudoClass = this.pseudoClass.pseudoClassMaster;
      check(pseudoClass, 'this pseudoClass instance has NO pseudoClassMaster reference ... you must create it with SmartClassRef.createSmartObject()');

      // the smartClassRef is maintained by the SmartPkg package manager
      const pseudoClassRef = pseudoClass.smartClassRef;
      check(pseudoClassRef, 'this pseudoClass instance has NO smartClassRef reference ... it must be managed by a SmartPkg');

      return pseudoClassRef;
    }

    // interpret a real class instances (the only other case)
    // ... NOTE: even pseudoClass Masters revert to their real class :-)

    // the real class is defined by standard JavaScript constructs
    const realClass = this.constructor;

    // the smartClassRef is maintained by the SmartPkg package manager
    const realClassRef = realClass.smartClassRef;
    check(realClassRef, 'this real class instance has NO smartClassRef reference ... it must be managed by a SmartPkg');

    return realClassRef;
  }

  /**
   * An instance method returning the package name of self.
   *
   * @returns {string} the package name which promotes the class of
   * object.
   */
  getMyClassPkgName() { // ??%% soon to be obsolete (think ONLY used internally) ???? may decide to keep, just for convenience (implement in terms of this.getClassRef())
    return this.getClassRef().getClassPkgName();
  }

  /**
   * An instance method returning the class name of self (interpreting
   * BOTH real classes and pseudoClasses).
   *
   * @returns {string} the class name for this object (interpreting
   * BOTH real classes and pseudoClasses).
   */
  getMyClassName() {// ??%% soon to be obsolete ???? may decide to keep, just for convenience (?? RE-IMPLEMENT in terms of this.getClassRef())
    // interpret a pseudoClass instance
    if (this.pseudoClass && this.pseudoClass.isInstance() ) {
      return this.pseudoClass.id;
    }

    // interpret our real class name
    return getRealClassName(this.constructor);
  }

  /**
   * Polymorphically reveal self's properties that should be used to
   * reconstitute an equivalent object.  This is used by:
   *  - toSmartJSON() ... driving persistance
   *  - smartClone() .... in duplicating objects
   * With this polymorphic knowledge, these methods can be fully
   * implemented by the SmartModel base class.
   * 
   * Sub-classes can define their own properties, and include their
   * base-class as follows:
   * 
   * Sub-classes should accumulate their properties by including their
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
   * **Detail**:
   *
   * NOT ALL object properties should be encoded. There are cases
   * where this state should be reconstituted from logic rather from
   * the content driven by this method.  As an example, temporal
   * working state (such as mounted visuals) should be omitted.
   *
   * Remember this encoding is used to reconstitute an equivalent
   * object.
   *
   * In regard to pseudoClasses, the returned content will vary, based
   * on whether self is the pseudoClass MASTER definition, or an
   * INSTANCE of a pseudoClass.
   * $FOLLOW-UP$: refine getEncodingProps() to support BOTH persistence (toSmartJSON()) -AND- pseudoClass construction (smartClone())
   *              ... see: "NO WORK (I THINK)" in journal (1/20/2020)
   *              We may need to interpret different usages in support of BOTH:
   *                - persistence (toSmartJSON()) -AND-
   *                - pseudoClass construction (smartClone())
   *              - may supply param: enum CloningType: forCloning/forJSON
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
   * @param {function} [extraClassResolver] - an optional
   * function to supplement the standard class resolver, used in
   * hydrating self-referencing pseudoClasses found in SmartPkg (ex:
   * collage referencing scene instances).
   *
   * @returns {smartObject} a newly instantiated class-based object
   * from the supplied smartJSON.
   *
   * @throws {Error} an Error is thrown when the process could not
   * successfully complete.
   */
  static fromSmartJSON(smartJSON, extraClassResolver) {

    // NOTE: We do NOT validate any characteristic of our supplied smartJSON,
    //       because the way in which this algorithm is invoked (recursively),
    //       it can truly be ANY type of data!
    //       As an example, a sub elm of JSON could be a number or a string.

    // handle NO smartJSON
    // ... simply pass it through (null, undefined, etc. ... even false is OK :-)
    if (!smartJSON) {
      return smartJSON;
    }

    // handle arrays ... simply recursively decode all array items
    else if (Array.isArray(smartJSON)) {
      return smartJSON.map( item => SmartModel.fromSmartJSON(item, extraClassResolver) );
    }

    // handle JSON objects
    // ... two types (see below)
    else if (isPlainObject(smartJSON)) {

      // handle smartObjs (class-based object derivations of SmartModel)
      if (smartJSON.smartType) {

        // define our namedProps to feed into our constructor (from smartJSON),
        // recursively resolving each ref into real class-based objects (as needed)
        const namedProps = {};
        for (const key in smartJSON) {
          const val = smartJSON[key];

          // bypass selected keywords that are NOT part of the constructor namedProps
          if (key === 'smartType' || key === 'smartPkg' || key === 'isPseudoClassMaster') { // type info is for decoding only
            continue;
          }

          // recursively resolve each val into a real class-based object
          namedProps[key] = SmartModel.fromSmartJSON(val, extraClassResolver);
        }

        // determine the classRef (could be a real class or a pseudoClass)
        const classRef = getClassRefFromSmartJSON(smartJSON, extraClassResolver);

        // instantiate a real class-based object using our value-added constructor
        // that handles BOTH real classes and pseudoClasses
        return classRef.createSmartObject(namedProps);
      }

      // handle plain NON class-based objects
      // ... simply decode each item recursively
      else {
        const plainObj = Object.entries(smartJSON).reduce( (accum, [subName, subRef]) => {
          accum[subName] = SmartModel.fromSmartJSON(subRef, extraClassResolver) ;
          return accum;
        }, {} );
        return plainObj;
      }
    }
    
    // all other types are assumed to be immutable primitives, and simply passed through :-)
    // ... string, number, etc.
    // ... ALSO passes through class-based objects that are pre-hydrated
    //     USED in SmartPkg.fromSmartJSON(smartJSON) with it's 2-phase hydration
    return smartJSON;
  }


  /**
   * An instance method that creates a deep copy of self.
   * 
   * Within the cloning process, object creation is still based on
   * class instantiation ... dynamically performing a `new
   * Class(namedProps)`.  As such the supported object types are
   * limited to smartObjects (SmartModel derivations), native types,
   * arrays, and plain objects.  This heuristic applies not only to
   * the top-level object, but also it's subordinate objects within
   * the containment tree.
   *
   * NOTE: This algorithm is fully implemented within the SmartModel
   *       base class.  With the polymorphic knowledge of which
   *       properties to encode (see getEncodingProps()) it rarely
   *       needs to be overwritten.
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
    const encodingProps = this.getEncodingProps(); // $FOLLOW-UP$: refine getEncodingProps() to support BOTH persistence (toSmartJSON()) -AND- pseudoClass construction (smartClone())
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
            throw new Error(`***ERROR*** SmartModel.smartClone() processing self object of type ${this.getMyClassName()}, whose member object of type ${instanceValue.constructor.name} is NOT supported ... do NOT know how to clone this member :-(`);
          }
        }

        // all other types pass-through as-is, supporting primitive types (string, number, etc.) 
        else {
          clonedValue = instanceValue;
        }
      }

      // accumulate our running clonedProps
      clonedProps[instanceName] = clonedValue;

    });
    
    // instantiate a new copy of self (our cloned copy)
    const namedProps = {...clonedProps, ...overridingNamedProps}; // DEFENSIVE: overridingNamedProps take precedence -and- support overrides that are NOT part of our instance members
    const clonedCopy = new this.constructor(namedProps);          // NOTE: our entire cloning and persistance architecture is based on SmartModel constructors using named parameters!

    // that's all folks :-)
    return clonedCopy;
  }

} // end of ... SmartModel class
SmartModel.unmangledName = 'SmartModel';


//******************************************************************************
//*** Specifications
//******************************************************************************

/**
 * @typedef {Object} smartObject
 *
 * smartObject is an object instance that is a SmartModel derivation.  It
 * has the following characteristics:
 *
 * - The class constructor employs namedProps.  This is KEY aspect to
 *   make persistence work, because it supports data-driven injection
 *   from smartJSON.
 */


/**
 * @typedef {JSON} smartJSON
 * 
 * smartJSON is a self-contained JSON structure that can be
 * re-constituted back into a class-based object representation.
 * 
 * - it supports object containment (i.e. objects with depth),
 *   allowing an entire object tree to be  JSONized
 * 
 * - it is used for BOTH persistence and functional state management
 *   (in redux).
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
 * @typedef {ref} classRef // ??%% soon to be obsolete ... replaced by the REAL SmartClassRef ?? does anything in these docs need to move over?
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
 * A plain object, such as an object literal ...  `{a: 1, b: 2}` used
 * in JSON structures, namedProps, etc.
 */



//******************************************************************************
//*** Internal Helper Functions
//******************************************************************************

/**
 * Return the real class name of the supplied "real" clazz.
 *
 * IMPORTANT: This routine utilizes the clazz.unmangledName -and-
 *            verifies it's existence!
 * - class name is crucial for our persistence (hydration invokes
 *   constructor matching registered classes)
 * - the standard class.name is mangled in our production build (ex:
 *   yielding 't' for 'SmartComp')
 * - this is a central spot that will highlight issues very early
 *
 * @param {class} clazz - the real class to interpret.
 *
 * @returns {string} the supplied clazz's class name.
 */
function getRealClassName(clazz) { // ??%% soon to be obsolete

  // ?? NOW DONE IN SmartClassRef
  //? // verify there is an unmangledName property (see IMPORTANT above)
  //? // NOTE: MUST USE hasOwnProperty() because static class references
  //? //       will walk the hierarchy chain (as of ES6 classes)
  //? //       We MUST insure this concrete class has defined it's own
  //? //       unique unmangledName!!
  //? if (!clazz.hasOwnProperty('unmangledName')) {
  //?   throw new Error(`***ERROR*** class ${clazz.name} MUST have an "unmangledName" property (supporting persistence in obfuscated production build).`);
  //? }

  // that's all folks :-)
  return clazz.unmangledName;
}


/**
 * Return the classRef of the supplied smartJSON.
 *
 * @param {JSON} smartJSON - the smartJSON to interpret.
 *
 * @param {function} [extraClassResolver] - an optional
 * function to supplement the standard class resolver, used in
 * hydrating self-referencing pseudoClasses found in SmartPkg (ex:
 * collage referencing scene instances).
 *
 * @returns {SmartClassRef} the classRef of the supplied smartJSON
 *
 * @throws {Error} an Error is thrown when the class was not resolved.
 */
function getClassRefFromSmartJSON(smartJSON, extraClassResolver) {

  // glean our pkgName and className
  const pkgName   = smartJSON.smartPkg;
  const className = smartJSON.smartType;

  // resolve our classRef
  let classRef = null;

  // ... use extraClassResolver (when supplied)
  if (extraClassResolver) {
    classRef = extraClassResolver(pkgName, className);
    if (classRef) {
      return classRef;
    }
  }

  // ... use standard pkgManager class resolver
  try {
    classRef = pkgManager.getClassRef(pkgName, className);
  }
  catch (err) {
    console.log(`***ERROR*** SmartModel.fromSmartJSON() could not resolve pkgName: ${pkgName} / className: ${className} 
... smartJSON: ${JSON.stringify(smartJSON, null, 2)}`);
    throw err.defineAttemptingToMsg('hydrate smartObj (see logs for smartJson)');
  }
  return classRef;
}
