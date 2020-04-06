import verify              from 'util/verify';
import {isString,
        isObject,
        isPlainObject,
        isSmartObject,
        isFunction,
        isClass}           from 'util/typeCheck';
import checkUnknownArgs    from 'util/checkUnknownArgs';
import pkgManager          from './pkgManager';
import PseudoClass         from './PseudoClass';
import DispMode            from './DispMode';
import smartTraversalSetup from './smartTraversalSetup';
import crc                 from 'util/crc';
import {toast}             from 'util/notify';
import changeManager       from 'features/common/changeManager/changeManager'; // AI: pull from horses mouth (rather than 'features/xtra') to avoid circular import in core/Scene.js ... ReferenceError: Cannot access 'SmartPallet' before initialization

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
   * Return self's object id.
   */
  getId() {
    return this.id;
  }

  /**
   * Return self's object name.
   */
  getName() {
    return this.name;
  }

  /**
   * Return an indicator as to whether self is a SmartObject (a
   * SmartModel derivation).
   *
   * NOTE: These isaXyz() methods provide a way to perform instanceof
   *       checks without requiring core class imports, which is more
   *       vulnerable to circular dependencies (especially when used
   *       in core)!
   *
   *       As a convenience, this method is fronted by `isSmartObject(ref)`
   *       (found in `util/typeCheck.js`) which accommodates all data
   *       type conditions (undefined, primitives, any object, etc.).
   *
   * @returns {boolean} `true`: self is a SmartObject (a SmartModel
   * derivation), `false` otherwise.
   */
  isaSmartObject() {
    return true;
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
   *     const encodingProps = [['x',0], ['y',0]];
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
   * `smartClone()` is making the request).  When cloning, additional
   * properties may be supplied (over and above what would be
   * re-constituted from a constructor invocation).  Please interpret
   * this value using "truthy" semantics.
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
   * Iterate over all self's encoding properties, executing the
   * supplied `cbFn` for each property.
   *
   * As a convenience, the entire encoding structure is deciphered,
   * including:
   *  - propName
   *  - propValue
   *  - defaultValue (optional - when not defined, an obscure
   *    `'DeFaUlT NoT dEfInEd'` value is used)
   *
   * @param {function} cbFn - the callback function to execute for each
   * encoding property.  API:
   *   ```js
   *   + cbFn(propName, propValue, defaultValue): void
   *   ```
   *
   * @param {boolean} forCloning - an indicator as to whether this
   * request is on behalf of the cloning operation (true:
   * `smartClone()` is making the request).  When cloning, additional
   * properties may be supplied (over and above what would be
   * re-constituted from a constructor invocation).  Please interpret
   * this value using "truthy" semantics.
   */
  encodingPropsForEach(cbFn, forCloning=false) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.encodingPropsForEach() parameter violation: `);
    // ... cbFn
    check(cbFn,             'cbFn is required');
    check(isFunction(cbFn), 'cbFn must be a function');
    // ... forCloning
    check(forCloning===true ||
          forCloning===false,   'forCloning must be a boolean (when supplied)');

    // iteration loop
    // ... driven by self's smartObj encoding properties
    const encodingProps = this.getEncodingProps(forCloning);
    encodingProps.forEach( (prop) => {
      // decipher propName/propValue
      const [propName, defaultValue] = Array.isArray(prop) ? prop : [prop, 'DeFaUlT NoT dEfInEd'];
      const propValue = this[propName];
      
      // callback into invoker realm
      cbFn(propName, propValue, defaultValue);
    });
  }

  /**
   * Provide a reducer, by iterating over all self's encoding
   * properties, executing the supplied `cbFn` (a reducer) for each
   * property, resulting in a single output value.
   *
   * As a convenience, the entire encoding structure is deciphered,
   * including:
   *  - propName
   *  - propValue
   *  - defaultValue (optional - when not defined, an obscure
   *    `'DeFaUlT NoT dEfInEd'` value is used)
   *
   * @param {function} cbFn - the callback reducer function to execute
   * for each encoding property.  API:
   *   ```js
   *   + cbFn(accum, propName, propValue, defaultValue): accumAmalgamation
   *   ```
   * NOTE: That if NO 
   *
   * @param {boolean} forCloning - an indicator as to whether this
   * request is on behalf of the cloning operation (true:
   * `smartClone()` is making the request).  When cloning, additional
   * properties may be supplied (over and above what would be
   * re-constituted from a constructor invocation).  Please interpret
   * this value using "truthy" semantics.
   *
   * @param {any} initialAccum - the initial accumulation value.  This
   * seeds the `accum` parameter (of the `cbFn()`) for the first
   * iteration.
   *
   * @returns {any} the single output value resulting from the
   * reduction.
   */
  encodingPropsReduce(cbFn, forCloning=false, initialAccum) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.encodingPropsReduce() parameter violation: `);
    // ... cbFn
    check(cbFn,             'cbFn is required');
    check(isFunction(cbFn), 'cbFn must be a function');
    // ... forCloning
    check(forCloning===true ||
          forCloning===false,   'forCloning must be a boolean (when supplied)');
    // ... initialAccum
    check(initialAccum!==undefined, 'initialAccum is required');

    // iteration loop
    // ... driven by self's smartObj encoding properties
    const encodingProps = this.getEncodingProps(forCloning);
    const accum = encodingProps.reduce( (accum, prop) => {
      // decipher propName/propValue
      const [propName, defaultValue] = Array.isArray(prop) ? prop : [prop, 'DeFaUlT NoT dEfInEd'];
      const propValue = this[propName];
      
      // callback into invoker realm
      return cbFn(accum, propName, propValue, defaultValue);
    }, initialAccum);

    // promote the overall accumulation
    return accum;
  }


  /**
   * Return the crc hash for this object, uniquely identifying self.
   * 
   * This hash is generated as needed, utilizing an optimized cache.
   * 
   * NOTE: This algorithm is fully implemented within the SmartModel
   *       base class.  With the polymorphic knowledge of which
   *       properties to process (see getEncodingProps()) it rarely
   *       needs to be overwritten.
   *
   * @returns {number} self's crc hash that uniquely identifies self
   */
  getCrc() {

    // calculate/retain our crc as needed
    if (!this._crc) { // ... either first time, or cache is being regenerated

      // setup our traversal through a series of `getCrc()` specific type handlers
      const traverse = smartTraversalSetup({

        onBehalfOf: `${this.diagClassName()}.getCrc()`,

        handleNoRef(accumCrc, resume, noRef) {
          return crc(noRef, accumCrc); // ... crc of null/undefined (just for good measure)
        },

        handleSmartObj(accumCrc, resume, smartObjRef) {
          // fold in it's getCrc()
          // ... should be OK to use a crc as the value of another crc calc
          accumCrc = crc(smartObjRef.getCrc(), accumCrc);
          return accumCrc;
        },

        handlePlainObj(accumCrc, resume, plainObjRef) {
          // fold in the crc of each property
          accumCrc = Object.entries(plainObjRef).reduce( (accum, [subPropName, subPropValue]) => {
            accum = crc(subPropName,     accum); // accum the prop name  (string) ... for good measure (shouldn't hurt)
            accum = resume(subPropValue, accum); // accum the prop value (any type)
            return accum;
          }, accumCrc);
          return accumCrc;
        },

        handleClass(accumCrc, resume, classRef) {
          // fold in class name (unsure if this is needed)
          accumCrc = crc(classRef.name, accumCrc);
          return accumCrc;
        },

        handlePrimitive(accumCrc, resume, primitiveRef) {
          // fold in the primitive's crc
          accumCrc = crc(primitiveRef, accumCrc);
          return accumCrc;
        },

      });

      // our crc is driven by self's instance properties
      this._crc = this.encodingPropsReduce( (accumCrc, propName, propValue, defaultValue) => {

        // recursively accumulate the crc of each instance props
        // ... interpreting arrays, primitives, and SmartModel
        accumCrc = crc(propName,       accumCrc); // accum the prop name  (string) ... for good measure (shouldn't hurt)
        accumCrc = traverse(propValue, accumCrc); // accum the prop value (any type)

        return accumCrc;

      }, false,/*forCloning*/ 0/*initialAccum*/);

      // console.log(`xx ${this.diagClassName()}.getCrc() CALCULATING CRC from props: ${encodingProps} ... CRC: ${this._crc}`);
    }
    else {
      // console.log(`xx ${this.diagClassName()}.getCrc() using CACHE ... CRC: ${this._crc}`);
    }

    // that's all folks
    return this._crc;
  }

  /**
   * Return an indicator as to whether self is "in sync" with it's
   * base version (i.e. the version saved on disk).
   *
   * An "out of sync" state indicates that modifications have occurred,
   * and that a "save" operation is needed.
   *
   * @returns {boolean} self's "in sync" status with it's base version
   * (true: in-sync, false: out-of-sync).
   */
  isInSync() {
    return this.getBaseCrc() === this.getCrc();
  }

  /**
   * Return the baseline crc hash for this object.
   *
   * This represents the crc from an initial version (typically a
   * saved resource), and is used to determine when an item is "out of
   * sync" (i.e. needs to be saved).
   *
   * @returns {number} self's baseline crc
   */
  getBaseCrc() {
    // NOTE: when NOT defined, we still do NOT want to dynamically save this._baseCrc
    //       - EX:   this._baseCrc = this.getCrc();
    //       - BAD:  it is really too late for this
    //               ... we have no idea if this time represents our baseline
    //       - GOOD: just depend on resetBaseCrc() being invoked at the appropriate times
    return this._baseCrc;
  }

  /**
   * Reset the baseline crc throughout our containment tree.
   *
   * This represents the crc from an initial version (typically a
   * saved resource), and is used to determine when an item is "out of
   * sync" (i.e. needs to be saved).
   * 
   * This method is invoked:
   *  - at SmartPkg constructor (covering code-based packages)
   *  - and at persistance time (load/save)
   *  - NO: dynamically on getBaseCrc() ... see NOTE in getBaseCrc()
   * 
   * NOTE: This algorithm is fully implemented within the SmartModel
   *       base class.  With the polymorphic knowledge of which
   *       properties to process (see getEncodingProps()) it rarely
   *       needs to be overwritten.
   */
  resetBaseCrc() {

    // setup our traversal through a series of `resetBaseCrc()` specific type handlers
    const traverse = smartTraversalSetup({

      onBehalfOf: `${this.diagClassName()}.resetBaseCrc()`,

      handleSmartObj(accumCrc, resume, smartObjRef) {
        // propagate into our subordinate smartObj
        smartObjRef.resetBaseCrc();
      },

      handlePlainObj(accumCrc, resume, plainObjRef) {
        // propagate into our subordinate plain objects
        Object.values(plainObjRef).forEach( (item) => resume(item) );
      },

      handleClass(accumCrc, resume, classRef) {
        // no-op ... currently there is NO crc recorded in raw classes
      },

      handlePrimitive(accumCrc, resume, primitiveRef) {
        // no-op ... resetBaseCrc does NOTHING for primitives
      },

    });

    // retain self's prior baseline crc
    const old_baseCrc = this._baseCrc;

    // trickle this request down through our containment tree, driven by self's instance properties
    this.encodingPropsForEach(
      (propName, propValue, defaultValue) => traverse(propValue),
      false/*forCloning*/
    );

    // reset self's new baseline crc
    // ... this is done AFTER our lower-level subordinate objects
    //     - probably NOT necessary, because normally these CRCs are adjusted from the "ground up"
    //     - HOWEVER, it doesn't hurt (more of a defensive measure)
    const new_baseCrc = this._baseCrc = this.getCrc();

    // retain baseCrc state changes for ePkgs (when baseCrc changes)
    const baseCrcChanged = old_baseCrc !== new_baseCrc;
    if (this.isaEPkg() && baseCrcChanged) {
      changeManager.ePkgChanged(this);
    }
  }


  /**
   * Return an indicator as to whether self is a pkg (SmartPkg).
   *
   * NOTE: These isaXyz() methods provide a way to perform instanceof
   *       checks without requiring core class imports, which is more
   *       vulnerable to circular dependencies (especially when used
   *       in core)!
   *
   *       As a convenience, this method is fronted by `isPkg(ref)`
   *       (found in `util/typeCheck.js`) which accommodates all data
   *       type conditions (undefined, primitives, any object, etc.).
   *
   * @returns {boolean} `true`: self is a package (SmartPkg), `false` otherwise.
   */
  isaPkg() {
    return false; // ... NOTE: overridden in SmartPkg
  }

  /**
   * Return the pkg (SmartPkg) self belongs to (or self when it is a
   * SmartPkg).
   * 
   * NOTE: This is the SmartPkg that self belongs to (e.g. 'com.astx.ACME'),
   *       NOT the package self was created from: (e.g. 'core').
   *
   * @returns {SmartPkg} the pkg (SmartPkg) self belongs to (or self
   * when it is a SmartPkg), `undefined` when outside our supported
   * "primary" containment tree.
   */
  getPkg() {
    // when self is a SmartPkg, we have found it!
    if (this.isaPkg()) {
      return this;
    }
    // follow our parent chain, till we find the SmartPkg
    const  parent = this.getParent();
    return parent ? parent.getPkg() : undefined;
  }

  /**
   * Return an indicator as to whether self is a PkgEntry or not.
   *
   * PkgEntries are top-level entries registered to a package (SmartPkg).
   * - They are visible in the LeftNav.
   * - They are displayed in a tab (ex: Scene, Collage, Comp).
   * - They are visually critical in monitoring whether they are in-sync
   *   with their file resources.
   *
   * PkgEntries are managed by SmartPkg, simply marking them using the
   * `markAsPkgEntry()` method.
   *
   * NOTE: As a convenience, this method is fronted by `isPkgEntry(ref)`
   *       (found in `util/typeCheck.js`) which accommodates all data
   *       type conditions (undefined, primitives, any object, etc.).
   *
   * @returns {boolean} `true`: self is a PkgEntry, `false` otherwise.
   */
  isaPkgEntry() {
    return this._pkgEntry ? true : false;
  }

  /**
   * Return the PkgEntry self belongs to (or self when it is a
   * PkgEntry).
   *
   * @returns {PkgEntry} the PkgEntry self belongs to (or self when it
   * is a PkgEntry), `undefined` when outside our supported "primary"
   * containment tree.
   */
  getPkgEntry() {
    // when self is a PkgEntry, we have found it!
    if (this.isaPkgEntry()) {
      return this;
    }
    // follow our parent chain, till we find the PkgEntry
    const  parent = this.getParent();
    return parent ? parent.getPkgEntry() : undefined;
  }

  /**
   * Mark self as a PkgEntry (see notes in `isaPkgEntry()`).
   */
  markAsPkgEntry() {
    // mark self as a PkgEntry
    this._pkgEntry = true;

    // ALSO: maintain changeManager state
    changeManager.registerEPkg(this);
  }

  /**
   * Return an indicator as to whether self is an EPkg:
   * - either a pkg (SmartPkg)
   * - or a pkgEntry (top-level entries registered to a SmartPkg)
   *
   * These two objects are consolidated in the EPkg nomenclature, to
   * accommodate the `changeManager` feature state, where EPkgs are
   * tracked.
   *
   * NOTE: As a convenience, this method is fronted by `isEPkg(ref)`
   *       (found in `util/typeCheck.js`) which accommodates all data
   *       type conditions (undefined, primitives, any object, etc.).
   *
   * EPkgAI: EPkg may be obsolete with Svelte usage (it is an anomaly
   *         of changeManager redux state management)
   *
   * @returns {boolean} `true`: self is an EPkg, `false` otherwise.
   */
  isaEPkg() {
    return this.isaPkg() || this.isaPkgEntry();
  }

  /**
   * Return the EPkg ID (see notes in isaEPkg).
   *
   * Examples:
   * - 'com.astx.ACME' .......... for pkg (SmartPkg)
   * - 'com.astx.ACME/scene1' ... for pkgEntry
   *
   * EPkgAI: EPkg may be obsolete with Svelte usage (it is an anomaly
   *         of changeManager redux state management)
   *
   * @returns {string} self's EPkg ID.
   *
   * @throws {Error} when self is NOT an EPkg.
   */
  getEPkgId() {
    if (this.isaPkg()) {
      return this.getPkgId();
    }
    else if (this.isaPkgEntry()) {
      return `${this.getPkg().getPkgId()}/${this.getId()}`;
    }
    else {
      throw new Error(`***ERROR*** ${this.diagClassName()}.getEPkgId() [id:${this.id}]: self is NOT an EPkg!`);
    }
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
   * Set self's parent object, with respect to the "primary"
   * containment tree (i.e. NOT view related).
   *
   * @param {SmartObject} parent - the parent object of self.
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Return an indicator as to whether self is a view (SmartView).
   *
   * NOTE: These isaXyz() methods provide a way to perform instanceof
   *       checks without requiring core class imports, which is more
   *       vulnerable to circular dependencies (especially when used
   *       in core)!
   *
   *       As a convenience, this method is fronted by `isView(ref)`
   *       (found in `util/typeCheck.js`) which accommodates all data
   *       type conditions (undefined, primitives, any object, etc.).
   *
   * @returns {boolean} `true`: self is a view (SmartView), `false` otherwise.
   */
  isaView() {
    return false; // ... NOTE: overridden in SmartView
  }

  /**
   * Return the SmartView self belongs to (or self when it is a
   * SmartView)
   *
   * @returns {SmartView} the SmartView self belongs to (or self when
   * it is a SmartView), `undefined` when outside our supported "view"
   * containment tree.
   */
  getView() {
    // when self is a SmartView, we have found it!
    if (this.isaView()) {
      return this;
    }

    // follow our "view" containment tree, till we find the SmartView
    const  viewParent = this.getViewParent();
    return viewParent ? viewParent.getView() : undefined;
  }
  
  /**
   * Return self's parent object, with respect to the "view"
   * containment tree (i.e. NOT "primary" related).
   *
   * @returns {SmartObject} the "view" parent object of self,
   * `undefined` when at top (e.g. SmartView).
   */
  getViewParent() {
    // `this.viewParent` takes precedence, otherwise `this.parent` is a "shared chain"
    return this.viewParent ? this.viewParent : this.parent;
  }
  
  /**
   * Set self's parent object, with respect to the "view" containment
   * tree (i.e. NOT "primary" related).
   *
   * @param {SmartObject} parent - the "view" parent object of self.
   */
  setViewParent(viewParent) {
    this.viewParent = viewParent;
  }

  /**
   * Trickle up low-level changes to our parentage (both the "primary"
   * and "view" containment tree.
   *
   * This propagates changes to various aspects, such as:
   *  - size
   *  - crc
   *
   * The `trickleUpChange()` when any change occurs
   *  - centrally by `changeManger.applyChange()`
   *  - also during an initial mount (replacing "approximation" size
   *    with "exact" size) ... see: `SmartView.mount()`
   *
   * @param {boolean} [sizeChanged=true] - an internal indicator as to
   * whether size has changed.  This should NOT be set by any public
   * invocation - only by our internal recursion.  It is an
   * optimization, that no-ops size re-calculation when the size has
   * NOT changed.  The entry-level default assumes size may have
   * changed (so it will always check for size changes)
   */
  trickleUpChange(sizeChanged=true) {

    //***
    //*** manage size (many things can impact container size)
    //***

    // when self promotes size, and size has changed (in our lower-containment tree)
    // ... regen self's size, keeping track of whether sizeChanged (for optimization)
    if (this.getSize && sizeChanged) {

      // retain our oldSize
      // ... via our cache (this exists when getSize() previously invoked)
      const oldSize = this.sizeCache ? this.sizeCache : {width:-1, height:-1};

      // clear our sizeCache allowing getSize() to regenerate
      this.sizeCache = undefined;

      // regen our size (i.e. our newSize)
      // ... internally, this retains our cache once more :-)
      const newSize = this.getSize();
      
      // perform any static binding of new size
      // ... only when size has changed
      sizeChanged = !(oldSize.width===newSize.width && oldSize.height===newSize.height);
      if (sizeChanged) {
        this.bindSizeChanges(oldSize, newSize);
      }
    }

    //***
    //*** manage crc changes
    //***

    // re-calculate self's crc
    const oldCrc = this._crc;
    this._crc    = undefined;     // clear the cached _crc
    const newCrc = this.getCrc(); // ... allowing getCrc() to recalculate it

    // retain crc state changes for ePkgs (when crc changes)
    const crcChanged = oldCrc !== newCrc;
    // console.log(`xx trickleUpChange on obj: ${this.diagClassName()} for CRC old: ${oldCrc} / new: ${newCrc} ... isaEPkg(): ${this.isaEPkg()} / crcChanged: ${crcChanged}`);
    if (this.isaEPkg() && crcChanged) {
      // console.log(`xx YES YES YES self is an EPkg who's CRC CHANGED ... issuing changeManager.ePkgChanged()`);
      changeManager.ePkgChanged(this);
    }

    //***
    //*** trickle up change to higher level
    //***

    // both to the "primary" containment tree
    const parent = this.parent;
    if (parent) {
      parent.trickleUpChange(sizeChanged);
    }

    // and the "view" containment tree
    const viewParent = this.viewParent;
    if (viewParent) {
      viewParent.trickleUpChange(sizeChanged);
    }

  }


  /**
   * Return self's dispMode (maintained in top-level PkgEntry objects - visible in LeftNav and Tabs).
   * @returns {DispMode} the dispMode of self.
   */
  getDispMode() {
    return this.dispMode;
  }

  /**
   * Set self's dispMode (maintained in top-level PkgEntry objects - visible in LeftNav and Tabs).
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
      // perform a pre-check to prevent edit mode when containing package cannot be persisted
      // ... ex: when the package contains code
      const pkg = this.getPkg();
      if (!pkg.canPersist()) {
        toast.warn({msg: `The "${this.getName()}" resource cannot be edited ` + 
                         `... normally it can, however it belongs to the "${pkg.getPkgName()}" package which ` +
                         `contains code (therefore you would not be able to save your changes).`});
        return;
      }

      // go forward with our normal edit enablement
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
   * Enable self's "view" DispMode (maintained in top-level PkgEntry objects - visible in LeftNav and Tabs).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.enableViewMode() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Enable self's "edit" DispMode (maintained in top-level PkgEntry objects - visible in LeftNav and Tabs).
   */
  enableEditMode() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.enableEditMode() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Enable self's "animate" DispMode (maintained in top-level PkgEntry objects - visible in LeftNav and Tabs).
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
   * REMEMBER: `this` is an object instance of SmartModel (because we are an
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
        if (isSmartObject(ref)) {
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

        // handle classes
        else if (isClass(ref)) {
          // NOTE: should never see this with visualize-it's pre-check: SmartPkg.canPersist()
          throw new Error(`***ERROR*** SmartModel.toSmartJSON() processing ref object of type ${ref.constructor.name} is NOT supported ... classes or functions CANNOT be persisted through the smartJSON format :-(`);
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
        if (isSmartObject(ref)) {
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

        // handle classes
        // ... simply pas-through as-is (i.e. clone is N/A because they are immutable)
        else if (isClass(ref)) {
          return ref;
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
 * @typedef {{width, height}} Size
 * 
 * A `size` consisting of {width, height}.
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
