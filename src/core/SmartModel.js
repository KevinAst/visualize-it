import verify            from 'util/verify';
import {isString,
        isObject,
        isPlainObject}   from 'util/typeCheck';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import pkgManager        from './pkgManager';
import PseudoClass       from './PseudoClass';
import DispMode          from './DispMode';

/**
 * SmartModel is the abstract top-level base class of the visualize-it
 * object model. 
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
 *  - identification (id/name):
 *    + constructor({id, name})
 *
 *  - persistance:
 *    + toSmartJSON():smartJSON ................. transforms self (with depth) into smartJSON
 *<S> + fromSmartJSON(smartJSON): smartObject ... reconstitutes class-based objects (with depth) from smartJSON
 *    + smartClone(): smartObject ............... creates a deep copy of self (used in pseudo constructor - SmartClassRef.createSmartObject(namedParams)))
 *    + getEncodingProps(forCloning): string[] .. polymorphically expose properties required to encode self
 *
 *  - meta info (more found in PseudoClass and SmartClassRef):
 *    + getClassRef(): SmartClassRef ... promotes the classRef from which self was created (unifying both real classes and pseudo classes)
 *    + diagClassName(): string ........ resolves real class name (unmangled) used in diagnostics (use getClassRef().getClassName() when pseudoClass needs to be interpreted)
 */
export default class SmartModel {

  /**
   * Create a SmartModel.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this object.
   * @param {string} [name=id] - the human interpretable name of this
   * object (DEFAULT to id).
   */
  constructor({id, name, ...unknownArgs}={}) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

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
    this.id       = id;
    this.name     = name || id;
    this.dispMode = DispMode.view; // ... our dispMode starts out "viewing" content
  }

  /**
   * Polymorphically reveal self's properties that should be used to
   * reconstitute an equivalent object.
   * 
   * The polymorphic knowledge provided by this method allows the
   * following two methods to be fully implemented in the SmartModel
   * base class:
   * 
   *  - toSmartJSON() ... driving persistance
   *  - smartClone() .... in duplicating objects
   *
   * In the simplest form, this method merely returns a `string[]` of
   * the property names to encode.
   *
   *   ```js
   *   class MyClass extends SmartModel {
   *     getEncodingProps(forCloning): {
   *       return ['prop1', 'prop2'];
   *     }
   *     ...
   *   }
   *   ```
   * 
   * Sub-classes may accumulate their properties to their parent
   * class, as follows:
   *
   *   ```js
   *   class MyClass extends SmartModel {
   *     getEncodingProps(forCloning): {
   *       return [...super.getEncodingProps(forCloning), ...['my', 'props', 'too']];
   *     }
   *     ...
   *   }
   *   ```
   * 
   * Each element in the returned array may either be:
   *  - a propName: string
   *  - or an ordered pair: `[propName, defaultValue]`
   *    ... defaultValues are an optimization.  The usage algorithms
   *        will omit values matching defaultValues, because they are
   *        expected to be reconstituted (by default) at
   *        instantiation.  As a result, these defaultValues should
   *        match the constructor default value semantics.
   *
   * As an example of this, let's say that in the sample above, the
   * `too` prop will default to `1` (in the constructor).  With this
   * knowledge, the encoding can be specified as follows:
   *
   *   ```js
   *   class MyClass extends SmartModel {
   *     constructor({my, props, too=1}): {
   *       ...
   *     }
   *     getEncodingProps(forCloning): {
   *       return [...super.getEncodingProps(forCloning), ...['my', 'props', ['too',1]]];
   *     }
   *     ...
   *   }
   *   ```
   * 
   * **Details**:
   *
   * NOT ALL object properties should be encoded.  There are cases
   * where the object state is reconstituted from logic (in the
   * constructor or elsewhere) rather from the content driven by this
   * method.  As an example, temporal working state (such as mounted
   * visuals) should be omitted.
   *
   * Remember this encoding is used to reconstitute an equivalent
   * object.
   *
   * **pseudoClass Details**:
   * 
   * pseudoClass implementations have additional considerations in
   * their `getEncodingProps()` implementation.
   * 
   * - General Rule: pseudoClass INSTANCEs should omit the props that
   *   will be reconstituted by the pseudoClass constructor (i.e. the
   *   pseudoClass MASTER).  This is similar to how a real class
   *   instantiation reconstitutes its internal state.
   * 
   * - HOWEVER, this rule is not in affect when the encoding props are
   *   being gathered for the purpose of cloning.  In this case, all
   *   non-temporal properties should be included, because it is more
   *   of a "raw" copy operation, where the additional props are NOT
   *   supplied through the pseudo constructor params.
   * 
   * - This is where the `forCloning` param comes in to play.
   *   Here is a pseudoClass example taken from `Scene`:
   *   
   *   ```js
   *   getEncodingProps(forCloning) {
   *     // define our "baseline"
   *     const encodingProps = [['x',0], ['y',0], '_size'];
   *   
   *     // conditionally include non-temporal props:
   *     // - for pseudoClass MASTERs
   *     // - for cloning operations
   *     if (this.pseudoClass.isType() || forCloning) {
   *       encodingProps.push('comps');
   *     }
   *   
   *     return [...super.getEncodingProps(forCloning), ...encodingProps];
   *   }      
   *   ```
   *
   * @param {boolean} forCloning - an indicator as to whether this
   * request is on behalf of the cloning operation (true:
   * `smartClone()` is making the request).  Otherwise the request is
   * being made by `toSmartJSON()`.  Please interpret this value using
   * "truthy" semantics.
   *
   * @returns {[propName, [propName, defaultValue], ...]} self's
   * property names (string) to be encoded in our smartJSON
   * representation (omitting values that match the optional
   * defaultValue).
   */
  getEncodingProps(forCloning) {
    return ['id', 'name'];
  }

  /**
   * Return the object id.
   */
  getId() {
    return this.id;
  }

  /**
   * Return the object name.
   */
  getName() {
    return this.name;
  }

  /**
   * Return the SmartPkg self belongs to.
   * 
   * NOTE: This is the SmartPkg that self belongs to (e.g. 'com.astx.KONVA'),
   *       NOT the package self was created from: (e.g. 'core').
   *
   * @returns {SmartPkg} the package self belongs to, `undefined` when
   * outside our supported "primary" containment tree.
   */
  getPackage() {
    // when self is a SmartPkg, we have found it!
    // ... we use a "duct type" check
    //     in lieu of `this instanceof SmartPkg`
    //     to avoid SmartPkg import (introducing a potential "Circular Dependency")
    if (this.getPkgId) {
      return this;
    }
    // follow our parent chain, till we find the SmartPkg
    const  parent = this.getParent();
    return parent ? parent.getPackage() : undefined;
  }

  /**
   * Return self's parent object, with respect to the "primary"
   * containment tree (i.e. NOT view related).
   *
   * @returns {SmartObject} the parent object of self, `undefined` for
   * top-level (e.g. SmartPkg).
   */
  getParent() {
    return this.parent;
  }

  /**
   * Return self's parent object, with respect to the "primary"
   * containment tree (i.e. NOT view related).
   *
   * @param {SmartObject} parent - the parent object of self.
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Return self's dispMode (used in top-level objects targeted by a tab).
   * @returns {DispMode} the dispMode of self.
   */
  getDispMode() {
    return this.dispMode;
  }

  /**
   * Set self's dispMode (used in top-level objects targeted by a tab).
   *
   * @param {DispMode} dispMode - the display mode to set.
   *
   * @throws {Error} an Error is thrown if the supplied dispMode is NOT supported.
   */
  setDispMode(dispMode) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.setDispMode() parameter violation: `);
    // ... dispMode
    check(dispMode,                     'dispMode is required');
    check(dispMode instanceof DispMode, 'dispMode must be a DispMode type');

    // ... insure self supports this setting
    check(this.canHandleDispMode(dispMode), `does NOT support ${dispMode} :-(`);

    // perform the set operation
    this.dispMode = dispMode;

    // fully enable this DispMode in the object model
    if (dispMode === DispMode.view) {
      this.enableViewMode();
    }
    else if (dispMode === DispMode.edit) {
      this.enableViewMode(); // a neutral reset
      this.enableEditMode();
    }
    else if (dispMode === DispMode.animate) {
      this.enableViewMode(); // a neutral reset
      this.enableAnimateMode();
    }
    else {
      throw new Error(`***ERROR*** ${this.diagClassName()}.setDispMode() [id:${this.id}]: unrecognized dispMode: ${dispMode}!`);
    }
  }

  /**
   * Return an indicator as to whether self supports the supplied `dispMode`.
   *
   * @param {DispMode} dispMode - the display mode to evaluate.
   *
   * @throws {boolean} true: can handle, false: not supported.
   */
  canHandleDispMode(dispMode) {
    return true;  // by default, base class assumes all DispModes are supported
  }

  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.enableViewMode() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.enableEditMode() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.enableAnimateMode() is an abstract method that MUST BE implemented!`);
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
    // ... using SmartClassRef, this structure considers BOTH real types/classes AND pseudoClasses
    const classRef = this.getClassRef();
    const myJSON = {
      smartType: classRef.getClassName(),
      smartPkg:  classRef.getClassPkgId(),
    };

    // demark the pseudoClass MASTERs in our JSON, so they can be hydrated early
    // ... see SmartPkg.fromSmartJSON()
    if (PseudoClass.isPseudoClassMaster(this)) {
      myJSON.isPseudoClassMaster = true;
    }

    // encode self's instance properties
    const encodingProps = this.getEncodingProps(false);
    encodingProps.forEach( (prop) => {
      const [propName, defaultValue] = Array.isArray(prop) ? prop : [prop, 'DeFaUlT NeVeR HaPpEn'];
      const value = this[propName];
      if (value !== defaultValue) { // conditionally accumulate the running JSON structure ONLY WHEN it is NOT the default
        myJSON[propName] = encodeRef(value);
      }
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
   * Return self's "real" class name, used for diagnostic purposes
   * (such as logs and errors).  The name is unmangled (even in
   * production builds).
   *
   * NOTE: Any usage that requires interpretation of pseudo classes,
   *       should use:
   *         this.getClassRef().getClassName()
   *       This is only available once package containers have been
   *       registered (e.g. pkgManager.registerPkg(smartPkg)!
   *
   * @returns {string} self's "real" class name.
   */
  diagClassName() {
    return this.constructor.unmangledName || this.constructor.name;
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

    // clone self's properties by recursively drilling through entire tree with depth
    // ... recursion is handled via internal cloneRef() function
    //     - it recurses on itself
    //     - supporting ALL data types
    //     - recurses back into this.smartClone() as needed
    const encodingProps = this.getEncodingProps(true);
    const clonedProps   = encodingProps.reduce( (accum, prop) => {

      // NOTE: smartClone() does NOT use the defaultValue of getEncodingProps()!
      //       It could, however it is a bit of a moot point, because this value is NOT persisted,
      //       so it matters little where we get it from :-)
      const [instanceName] = Array.isArray(prop) ? prop : [prop, 'DeFaUlT NoT Used'];

      // clone our instanceValue ONLY if it is not specified in our overridingNamedProps param
      if ( !overridingNamedProps.hasOwnProperty(instanceName) ) {
        const instanceValue = this[instanceName];      // self's instance member value
        const clonedValue   = cloneRef(instanceValue); // clone our instanceValue
        accum[instanceName] = clonedValue;             // accumulate our running clonedProps
      }

      return accum;
    }, {} );

    // accumulate all namedProps for our constructor
    // ... overridingNamedProps param take precedence
    //     -and- supports overrides that are NOT part of our instance members
    const namedProps = {...clonedProps, ...overridingNamedProps};

    // instantiate a new copy of self (our cloned copy)
    // ... NOTE: our entire cloning and persistance architecture is based on
    //           SmartModel constructors using named parameters!
    const clonedCopy = new this.constructor(namedProps);

    // that's all folks :-)
    return clonedCopy;

    // internal function that clones the supplied `ref`
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
    function cloneRef(ref) {

      // handle NO ref
      // ... simply pass it through (null, undefined, etc. ... even false is OK :-)
      if (!ref) {
        return ref;
      }

      // handle arrays ... simply encode all array items
      else if (Array.isArray(ref)) {
        const  clonedArr = ref.map( item => cloneRef(item) );
        return clonedArr;
      }

      // handle objects
      // ... various object types (see below)
      else if (isObject(ref)) {
        
        // handle smartObjs (class-based object derivations of SmartModel)
        if (ref instanceof SmartModel) {
          return ref.smartClone();
        }

        // handle plain objects
        // ... simply clone each subRef in a new plain object
        else if (isPlainObject(ref)) {
          const clonedPlainObj = Object.entries(ref).reduce( (accum, [subRefName, subRef]) => {
            accum[subRefName] = cloneRef(subRef);
            return accum;
          }, {} );
          return clonedPlainObj;
        }

        // UNSUPPORTED: class-based objects that are NOT smartObjs
        // ... CONSIDER (as needed) adding support for common objects like Date, etc.
        else {
          throw new Error(`***ERROR*** SmartModel.smartClone() processing self object of type ${this.diagClassName()}, ` +
                          `whose member object of type ${ref.constructor.name} is NOT supported ` +
                          '... only SmartModel derivations can be cloned :-(');
        }

      }

      // handle primitives (string, number, boolean, etc.)
      // ... simply pas-through as-is (i.e. clone is N/A because they are immutable)
      else {
        return ref;
      }

    } // end of ... cloneRef(ref)

  } // end of ... smartClone() method

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
 * @typedef {ref} ObjectLiteral
 * 
 * A plain object, such as an object literal ...  `{a: 1, b: 2}` used
 * in JSON structures, namedProps, etc.
 */



//******************************************************************************
//*** Internal Helper Functions
//******************************************************************************

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

  // glean our pkgId and className
  const pkgId     = smartJSON.smartPkg;
  const className = smartJSON.smartType;

  // resolve our classRef
  let classRef = null;

  // ... use extraClassResolver (when supplied)
  if (extraClassResolver) {
    classRef = extraClassResolver(pkgId, className);
    if (classRef) {
      return classRef;
    }
  }

  // ... use standard pkgManager class resolver
  try {
    classRef = pkgManager.getClassRef(pkgId, className);
  }
  catch (err) {
    console.log(`***ERROR*** SmartModel.fromSmartJSON() could not resolve pkgId: ${pkgId} / className: ${className} 
... smartJSON: ${JSON.stringify(smartJSON, null, 2)}`);
    throw err.defineAttemptingToMsg('hydrate smartObj (see logs for smartJson)');
  }
  return classRef;
}
