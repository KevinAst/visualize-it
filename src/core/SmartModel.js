/* eslint-disable react/no-is-mounted */ // isMount() usage is NOT react-based ?? should be able to nix this in svelte (ALSO LOOK FOR OTHERS)
import verify               from '../util/verify';
import {isString,
        isPlainObject,
        isFunction}         from '../util/typeCheck';
import checkUnknownArgs     from '../util/checkUnknownArgs';
import pkgManager           from './pkgManager';
import PseudoClass          from './PseudoClass';
import DispMode             from './DispMode';
import createTypeRefHandler from './createTypeRefHandler';
import SmartClassRef        from './SmartClassRef';

import {ChangeManager}      from './changeManager';

import crc                  from '../util/crc';
import {toast}              from '../util/ui/notify';

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
 *    + getEncodingProps(): string[] ............ polymorphically expose properties required to encode self
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
   * Promote the material icon "name" representing self's OO classification.
   *
   * @returns {string} the material icon name for self.
   */
  getIconName() {
    return 'not_listed_location'; // ... a big question mark
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
   * many  methods to be fully implemented in the SmartModel
   * base class, including:
   * 
   *  - toSmartJSON()
   *  - smartClone()
   *  - getCrc()
   *  - resetBaseCrc()
   *  - areClassesOutOfSync()
   *  - syncClassInstances()
   *  - etc.
   *
   * In the simplest form, this method merely returns a `string[]` of
   * the property names to encode.
   *
   *   ```js
   *   class MyClass extends SmartModel {
   *     getEncodingProps(): {
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
   *     getEncodingProps(): {
   *       return [...super.getEncodingProps(), ...['my', 'props', 'too']];
   *     }
   *     ...
   *   }
   *   ```
   * 
   * Each element in the returned array may either be:
   *  - a propName: string
   *  - or an ordered pair: `[propName, defaultValue]`
   *    ... defaultValues are an optimization.  Persistence related tasks
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
   *     getEncodingProps(): {
   *       return [...super.getEncodingProps(), ...['my', 'props', ['too',1]]];
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
   * - General Rule: 
   * 
   *   * pseudoClass INSTANCEs should omit the props that will be
   *     reconstituted by the pseudoClass constructor (i.e. the
   *     pseudoClass MASTER).  This is similar to how a real class
   *     instantiation reconstitutes its internal state.
   * 
   *   * pseudoClass MASTERs should include ALL props.
   *
   *   Here is a pseudoClass example taken from `Scene`:
   *   
   *     ```js
   *     getEncodingProps() {
   *     
   *       // define our "baseline"
   *       const encodingProps = [['x',0], ['y',0]];
   *     
   *       // for pseudoClass MASTERs, include non-temporal props
   *       // ... see JavaDoc for: SmartModel.getEncodingProps()
   *       if (this.pseudoClass.isType()) {
   *         encodingProps.push('comps');
   *       }
   *     
   *       return [...super.getEncodingProps(), ...encodingProps];
   *     }      
   *     ```
   *
   * @returns {[propName, [propName, defaultValue], ...]} self's
   * property names (string) to be encoded in our smartJSON
   * representation (omitting values that match the optional
   * defaultValue).
   */
  getEncodingProps() {
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
   */
  encodingPropsForEach(cbFn) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.encodingPropsForEach() parameter violation: `);
    // ... cbFn
    check(cbFn,             'cbFn is required');
    check(isFunction(cbFn), 'cbFn must be a function');

    // iteration loop
    // ... driven by self's smartObj encoding properties
    const encodingProps = this.getEncodingProps();
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
   *
   * @param {any} initialAccum - the initial accumulation value.  This
   * seeds the `accum` parameter (of the `cbFn()`) for the first
   * iteration.
   *
   * @returns {any} the single output value resulting from the
   * reduction.
   */
  encodingPropsReduce(cbFn, initialAccum) {

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.encodingPropsReduce() parameter violation: `);
    // ... cbFn
    check(cbFn,             'cbFn is required');
    check(isFunction(cbFn), 'cbFn must be a function');
    // ... initialAccum
    check(initialAccum!==undefined, 'initialAccum is required');

    // iteration loop
    // ... driven by self's smartObj encoding properties
    const encodingProps = this.getEncodingProps();
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

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const getCrcRefHandler = handlerCache.getCrcRefHandler = handlerCache.getCrcRefHandler || createTypeRefHandler({
      // fold in null/undefined (just for good measure)
      handleNoRef: (noRef, accumCrc) => crc(noRef, accumCrc),
      // fold in primitive's crc
      handlePrimitive: (primitiveRef, accumCrc) => crc(primitiveRef, accumCrc),
      // fold in array items
      handleArray: (arrRef, accumCrc) => arrRef.reduce( (accum, item) => getCrcRefHandler(item, accum), accumCrc ),
      // fold in the crc of each object property
      handlePlainObj: (plainObjRef, accumCrc) => (
        Object.entries(plainObjRef).reduce( (accum, [subPropName, subPropValue]) => {
          accum = crc(subPropName, accum); // accum the prop name  (string) ... for good measure (shouldn't hurt)
          accum = getCrcRefHandler(subPropValue, accum); // accum the prop value (any type)
          return accum;
        }, accumCrc)
      ),
      // fold in SmartObj.getCrc()
      // ... should be OK to use a crc as the value of another crc calc
      handleSmartObj: (smartObjRef, accumCrc) => crc(smartObjRef.getCrc(), accumCrc),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef, accum) {
        throw new Error(`***ERROR*** SmartObject.getCrc() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // fold in class name (unsure if this is needed)
      handleClass: (classRef, accumCrc) => crc(classRef.name, accumCrc),
    });

    // calculate/retain our crc as needed
    if (!this._crc) { // ... either first time, or cache is being regenerated

      // our crc is driven by self's instance properties
      this._crc = this.encodingPropsReduce( (accumCrc, propName, propValue, defaultValue) => {
        // recursively accumulate the crc of each instance props
        // ... interpreting arrays, primitives, and SmartModel
        accumCrc = crc(propName, accumCrc);               // accum the prop name  (string) ... for good measure (shouldn't hurt)
        accumCrc = getCrcRefHandler(propValue, accumCrc); // accum the prop value (any type)

        return accumCrc;
      }, 0/*initialAccum*/);

      // console.log(`xx ${this.diagClassName()}.getCrc() CALCULATING CRC from props: ${encodingProps} ... CRC: ${this._crc}`);
    }
    else {
      // console.log(`xx ${this.diagClassName()}.getCrc() using CACHE ... CRC: ${this._crc}`);
    }

    // that's all folks
    return this._crc;
  }

  /**
   * Reset self's crc.
   */
  resetCrc() {
    // by clearing _crc (the crc cached result), getCrc() will recalculate it on next request.
    this._crc = undefined;
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

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const resetBaseCrcRefHandler = handlerCache.resetBaseCrcRefHandler = handlerCache.resetBaseCrcRefHandler || createTypeRefHandler({
      // no-op null/undefined ... resetBaseCrc does NOTHING for NoRef
      handleNoRef: (noRef) => {},
      // no-op primitives ... resetBaseCrc does NOTHING for primitives
      handlePrimitive: (primitiveRef) => {},
      // propagate into our subordinate array items
      handleArray: (arrRef) => arrRef.forEach( (item) => resetBaseCrcRefHandler(item) ),
      // propagate into our subordinate plain objects
      handlePlainObj: (plainObjRef) => Object.values(plainObjRef).forEach( (item) => resetBaseCrcRefHandler(item) ),
      // propagate into our subordinate smartObjs
      handleSmartObj: (smartObjRef) => smartObjRef.resetBaseCrc(),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef) {
        throw new Error(`***ERROR*** SmartObject.resetBaseCrc() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // no-op classes ... currently there is NO crc recorded in raw classes
      handleClass: (classRef) => {},
    });

    // trickle this request down through our containment tree, driven by self's instance properties
    this.encodingPropsForEach( (propName, propValue, defaultValue) => resetBaseCrcRefHandler(propValue) );

    // reset self's new baseline crc
    // ... this is done AFTER our lower-level subordinate objects (in the recursive routine above)
    //     - probably NOT necessary, because normally these CRCs are adjusted from the "ground up"
    //     - HOWEVER, it doesn't hurt (more of a defensive measure)
    this._baseCrc = this.getCrc();

    // synchronize self's ChangeMonitor reflective store
    if (this.isaEPkg()) { // ... only for EPkg entries (same as ... `if (this.changeManager) {`)
      this.changeManager.syncMonitoredChange();
    }
  }

  /**
   * Mount the visuals of this node, binding the Konva graphics.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.any} containingKonvaContext - The container of
   * this node (varies - typically a Konva reference).
   */
  mount(containingKonvaContext) {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.mount() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Return an indicator as to whether self is mounted (i.e. bound to the Konva graphics).
   *
   * @returns {boolean} `true`: self is mounted, `false` otherwise
   */
  isMounted() {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.isMounted() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Unmount the visuals of this node, unbinding the Konva graphics.
   *
   * @param {boolean} [konvaPreDestroyed=false] - an internal
   * parameter that indicates if konva nodes have already been
   * destroyed (when a parent Konva.Node has already issued the
   * konvaNode.destroy()).
   */
  unmount(konvaPreDestroyed=false) {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.unmount() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Replace self's child reference, defined by the specified params.
   *
   * @param {any} oldRef - the existing child to be replaced with
   * `newRef`.
   *
   * @param {any} newRef - the new child to replace `oldRef`.
   */
  childRefChanged(oldRef, newRef) {
    throw new Error(`***ERROR*** SmartModel pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.childRefChanged() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Return an indicator as to whether the class self was created from
   * is out-of-sync with the latest class definition.
   *
   * Class versioning can become out-of-sync when interactive edits
   * occur to the class master.
   *
   * Currently, this is only operational for pseudo classes.  Real
   * code-based class versioning is not currently tracked, and will
   * always indicate they are in-sync.
   *
   * @returns {boolean} `true`: self's class is out-of-sync with the
   * latest class version, `false` otherwise.
   */
  isClassOutOfSync() {
    // obtain the classRef self was created from
    // ... NOTE: This is the same instance as if we pulled it directly from pkgManager!
    //           e.g. pkgManager.getClassRef(selfsClassRef.getClassPkgId(), selfsClassRef.getClassName());
    const selfsClassRef  = this.getClassRef();

    // handle pseudo classes
    if (selfsClassRef.isPseudoClass()) {
      // compare the class version self was created from
      // ... NOTE: versionCrcUsedInCreation is maintained by SmartClassRef.createSmartObject()
      // console.log(`xx ${this.diagClassName()}.isClassOutOfSync() ... a pseudoClassInstance from version: : ${this.pseudoClass.versionCrcUsedInCreation} ... selfsClassRef:\n`, selfsClassRef);
      return selfsClassRef.getClassVersionCrc() !== this.pseudoClass.versionCrcUsedInCreation;
    }

    // handle real classes
    // ... currently not tracked - consider them in-sync
    return false;
  }


  /**
   * Return an indicator as to whether any of the classes that make up
   * self (and it's containment tree) is out-of-sync with the latest
   * class definitions.
   *
   * Class versioning can become out-of-sync when interactive edits
   * occur to the class master.
   *
   * Currently, this is only operational for pseudo classes.  Real
   * code-based class versioning is not currently tracked, and will
   * always indicate they are in-sync.
   *
   * NOTE: This algorithm will short-circuit on the first out-of-sync
   *       class it finds.  This is accomplished using OR logic.
   *
   * @returns {boolean} `true`: some of self's containment classes is
   * out-of-sync with the latest class versions, `false` otherwise.
   */
  areClassesOutOfSync() {

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const outOfSyncHandler = handlerCache.outOfSyncHandler = handlerCache.outOfSyncHandler || createTypeRefHandler({
      // null/undefined can't be out-of-sync
      handleNoRef: (noRef, accumOutOfSync) => accumOutOfSync || false,
      // primitive's can't be out-of-sync
      handlePrimitive: (primitiveRef, accumOutOfSync) => accumOutOfSync || false,
      // analyze array items
      handleArray: (arrRef, accumOutOfSync) => arrRef.reduce( (accum, item) => accum || outOfSyncHandler(item, accum), accumOutOfSync ),
      // analyze plain object
      handlePlainObj: (plainObjRef, accumOutOfSync) => Object.values(plainObjRef).reduce( (accum, item) => accum || outOfSyncHandler(item, accum), accumOutOfSync ),
      // analyze SmartObj by recursing on our `areClassesOutOfSync()` method
      handleSmartObj: (smartObjRef, accumOutOfSync) => accumOutOfSync || smartObjRef.areClassesOutOfSync(),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef, accumOutOfSync) {
        throw new Error(`***ERROR*** SmartObject.areClassesOutOfSync() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // classes can't be out-of-sync
      handleClass: (classRef, accumOutOfSync) => accumOutOfSync || false,
    });

    // short-circuit process when we find our first out-of-date
    if (this.isClassOutOfSync()) {
      return true;
    }

    // trickle this request down through our containment tree, driven by self's instance properties
    return this.encodingPropsReduce( (accumOutOfSync, propName, propValue, defaultValue) => {
      return accumOutOfSync || outOfSyncHandler(propValue, accumOutOfSync); // short-circuit via OR (||)
    }, false/*initialAccum*/);
  }

  /**
   * Synchronize any out-of-date objects (within self and it's
   * containment tree), bringing them up-to-date with the latest class
   * definitions.
   *
   * Class versioning can become out-of-sync when interactive edits
   * occur to the class master.
   *
   * Currently, this is only operational for pseudo classes.  Real
   * code-based class versioning is not currently tracked, and will
   * always indicate they are in-sync.
   *
   * PREREQUISITE: When invoking this method, the management of the
   * Konva visuals must be addressed by surrounding the invocation
   * with:
   *   1. "unmounting" prior to invocation, and
   *   2. "remounting" after the invocation
   * Currently this is accomplished by our single invoking agent:
   * `syncOutOfDateClasses()`
   * ... the tabManager logic module that is activated whenever a tab is changed
   *     (src/features/common/tabManager/logic.js). ?? this is an obsolete reference
   */
  syncClassInstances() {

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const syncClassHandler = handlerCache.syncClassHandler = handlerCache.syncClassHandler || createTypeRefHandler({
      // null/undefined can't be out-of-sync
      handleNoRef: (noRef, accum) => {},
      // primitive's can't be out-of-sync
      handlePrimitive: (primitiveRef, accum) => {},
      // drill into array items
      handleArray: (arrRef, accum) => arrRef.forEach( (item) => syncClassHandler(item) ),
      // drill into plain object
      handlePlainObj: (plainObjRef, accum) => Object.values(plainObjRef).forEach( (item) => syncClassHandler(item) ),
      // analyze SmartObj by recursing on our `syncClassInstances()` method
      handleSmartObj: (smartObjRef, accum) => smartObjRef.syncClassInstances(),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef, accum) {
        throw new Error(`***ERROR*** SmartObject.syncClassInstances() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // classes can't be out-of-sync
      handleClass: (classRef, accum) => {},
    });

    // when self is out-of-date, resync it!
    if (this.isClassOutOfSync()) {

      // verify that our Konva visuals have been unmounted
      // ... see PREREQUISITE note (above)
      verify(!this.isMounted(), `${this.diagClassName()}.syncClassInstances() ... invoker must first issue unmount() on self.`);

      // re-create self by cloning it
      // ... because smartClone() re-instantiates class instances from
      //     the most current class definition, our new instance will be
      //     in-sync!
      // ... NOTE: We must directly issue smartClone() to get the
      //           correct result (picking up the correct instance
      //           state and class state)
      //           NOT: this.getClassRef().createSmartObject()
      //                ... see: "two-phase" NOTE in smartClone()
//    const newSelf = this.getClassRef().createSmartObject(); // NO
      const newSelf = this.smartClone();                      // YES
      // console.log(`xx ${this.diagClassName()}.syncClassInstances() self is out-of-date:\n`, {oldRef: this, newRef: newSelf});

      // patch in our re-synced newSelf within our containment tree (replacing self)
      // ... both to the "primary" containment tree
      const parent = this.getParent();
      if (parent) {
        newSelf.parent = parent;               // ... back-reference
        parent.childRefChanged(this, newSelf); // ... forward-reference
      }
      // ... and the "view" containment tree
      const viewParent = this.viewParent;
      if (viewParent) {
        newSelf.viewParent = viewParent;           // ... back-reference
        viewParent.childRefChanged(this, newSelf); // ... forward-reference
      }

      // short-circuit our process
      // ... there is no need to go any further IN THIS path
      //     BECAUSE this entire containment tree path is now in-sync!
      return;
    }

    // trickle this request down through our containment tree, driven by self's instance properties
    this.encodingPropsForEach( (propName, propValue, defaultValue) => syncClassHandler(propValue) );
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
   * Return the "qualified" identifier for a PkgEntry.
   *
   * Example:
   * - 'com.astx.ACME/scene1'
   *
   * @returns {string} self's PkgEntry ID.
   *
   * @throws {Error} when self is NOT a PkgEntry.
   */
  getPkgEntryId() {
    if (this.isaPkgEntry()) {
      return `${this.getPkg().getPkgId()}/${this.getId()}`;
    }
    else {
      throw new Error(`***ERROR*** ${this.diagClassName()}.getPkgEntryId() [id:${this.id}]: self is NOT a PkgEntry!`);
    }
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

    // ALSO: register self (PkgEntry) to changeManager
    // this maintains our this.changeManager linkage
    new ChangeManager(this);
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
      return this.getPkgEntryId();
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
   * The `trickleUpChange()` should be invoked when any change occurs:
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

    // reset self's crc
    this.resetCrc();
    
    // synchronize self's ChangeMonitor reflective store
    if (this.isaEPkg()) { // ... only for EPkg entries (same as ... `if (this.changeManager) {`)
      this.changeManager.syncMonitoredChange();
    }

    //***
    //*** trickle up change to higher level
    //***

    // both to the "primary" containment tree
    const parent = this.getParent();
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
   * NOTE: This method should be considered to be private.  Instead,
   *       use `changeManager.changeDispMode(dispMode)` in order to
   *       insure the proper reflection is applied.
   *
   * @param {DispMode} dispMode - the display mode to set.
   *
   * @throws {Error} an Error is thrown if the supplied dispMode is NOT supported.
   *
   * @private
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
        toast({msg: `The "${this.getName()}" resource cannot be edited ` + 
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

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const toSmartJSONRefHandler = handlerCache.toSmartJSONRefHandler = handlerCache.toSmartJSONRefHandler || createTypeRefHandler({
      // pass through null/undefined references
      handleNoRef: (noRef, accumJSON) => noRef,
      // pass through primitives
      handlePrimitive: (primitiveRef, accumJSON) => primitiveRef,
      // encode all array items
      handleArray: (arrRef, accumJSON) => arrRef.map( item => toSmartJSONRefHandler(item) ),
      // encode plain object
      handlePlainObj: (plainObjRef, accumJSON) => (
        Object.entries(plainObjRef).reduce( (accum, [subRefName, subRef]) => {
          accum[subRefName] = toSmartJSONRefHandler(subRef);
          return accum;
        }, {} )
      ),
      // encode SmartObjs toSmartJSON()
      handleSmartObj: (smartObjRef, accumJSON) => smartObjRef.toSmartJSON(),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef, accumJSON) {
        throw new Error(`***ERROR*** SmartObject.toSmartJSON() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // UNSUPPORTED: class reference
      handleClass(classRef, accumJSON) {
        throw new Error(`***ERROR*** SmartObject.toSmartJSON() traversal encountered reference of unsupported type - class or function: ${classRef.name} :-(`);
      },
    });

    // prime our JSON by encoding our smart type information
    // ... using SmartClassRef, this structure considers BOTH real types/classes AND pseudoClasses
    const classRef = this.getClassRef();
    const myJSON = {
      smartType: classRef.getClassName(),
      smartPkg:  classRef.getClassPkgId(),
    };

    // demark the pseudoClass MASTERs in our JSON, so they can be hydrated early
    // ... see SmartModel.fromSmartJSON()
    if (PseudoClass.isPseudoClassMaster(this)) {
      myJSON.isPseudoClassMaster = true;
    }

    // encode self's instance properties
    this.encodingPropsForEach( (propName, propValue, defaultValue) => {
      // conditionally accumulate the running JSON structure ONLY WHEN it is NOT the default
      if (propValue !== defaultValue) {
        myJSON[propName] = toSmartJSONRefHandler(propValue);
      }
    });

    // beam me up Scotty :-)
    return myJSON;
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
    const check = verify.prefix(`${this.diagClassName()}.getClassRef() id:'${this.id}', name:'${this.name}') ... `);

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
   * @returns {smartObject} a newly instantiated class-based object
   * from the supplied smartJSON.
   *
   * @throws {Error} an Error is thrown when the process could not
   * successfully complete.
   */
  static fromSmartJSON(smartJSON) {

    // validate supplied parameters
    const check = verify.prefix('SmartModel.fromSmartJSON(smartJSON) parameter violation: ');
    // ... smartJSON
    check(smartJSON,                     'smartJSON is required');
    check(isPlainObject(smartJSON),      'smartJSON must be a JSON structure');
    check(isString(smartJSON.smartType), 'smartJSON must be a JSON structure for a SmartObject (a SmartModel derivation)');

    // ***
    // *** Preliminary Setup
    // ***

    // the pkgId being resolved (defined when hydrating a top-level SmartPkg)
    let pkgIdBeingResolved = null;

    // our catalogs of preresolved objects - pseudoClassMasters
    // ... objects in these catalogs are implicitly part of the pkg: pkgIdBeingResolved

    // preresolvedObjects: optimize hydrateObject() so it doesn't have to resolve preresolved objects twice
    //   KEY              VALUE                         
    //   ===============  ==============================
    //   jsonFragmentObj  smartObj (a pseudoClassMaster)
    const preresolvedObjects = new Map();

    // preresolvedPseudoClassMasters: supplements resolveClassRefFromSmartJSON() for self-referencing pseudoClasses
    //   KEY              VALUE                         
    //   ===============  ==============================
    //   className        smartObj (a pseudoClassMaster)  
    const preresolvedPseudoClassMasters = new Map();


    // a convenience function that resolves the classRef of the supplied smartJSON
    // - combining the standard external pkgManager class resolver
    // - with the self-referencing pseudoClasses of the pkg being resolved
    // RETURN: classRef (a SmartClassRef)
    // THROW:  Error when the class was not resolved
    function resolveClassRefFromSmartJSON(smartJSON) {

      // glean our pkgId and className from the supplied smartJSON
      const pkgId     = smartJSON.smartPkg;
      const className = smartJSON.smartType;

      // preresolvedPseudoClassMasters catalog takes precedence
      // ... objects in this catalog are implicitly part of the pkg: pkgIdBeingResolved
      //     SO the request must match this pkg
      if (pkgId === pkgIdBeingResolved) {
        const pseudoClassMaster = preresolvedPseudoClassMasters.get(className);
        if (pseudoClassMaster) { // ... found it
          // NOTE: the .smartClassRef dereference is the same thing that is done in
          //       SmartPkg.getClassRef(className)
          //       via: pkgManager.getClassRef(pkgId, className)
          return pseudoClassMaster.smartClassRef;
        }
      }

      // fallback to the standard external pkgManager class resolver
      try {
        return pkgManager.getClassRef(pkgId, className);
      }
      catch (err) {
        // supplement errors with logs and an "attempting to" directive
        console.log(`***ERROR*** SmartModel.fromSmartJSON() could not resolve pkgId: ${pkgId} / className: ${className} ` +
                    `... smartJSON: ${JSON.stringify(smartJSON, null, 2)}`);
        throw err.defineAttemptingToMsg('hydrate smartObj (see logs for smartJson)');
      }
    }


    // ***
    // *** PHASE-1: Preresolve any pseudoClass MASTER definitions
    // ***          ... in support of self-referencing pseudoClasses
    // ***              ex: a collage referencing self-contained scene instances
    // ***

    // PHASE-1 is only executed when we are hydrating SmartPkg objects
    // ... this is the only place where there can be self-referencing pseudoClasses
    if (smartJSON.smartType === 'SmartPkg') {

      // retain the pkgId being resolved
      // NOTE: for SmartPkg JSON, the top-level id IS the package ID
      //       ... see: SmartPkg.getPkgId()
      pkgIdBeingResolved = smartJSON.id;

      // recursively preresolve our pseudoClass MASTER definitions
      preresolvePseudoClassMasters(smartJSON.rootDir);
    }

    // our recursive function that preresolves the pseudoClass MASTERs
    // UPDATES: preresolvedObjects/preresolvedPseudoClassMasters catalogs
    function preresolvePseudoClassMasters(jsonPkgTree) {

      // recurse directories (PkgTreeDir)
      if (jsonPkgTree.smartType === 'PkgTreeDir') {
        jsonPkgTree.entries.forEach( (jsonSubEntry) => preresolvePseudoClassMasters(jsonSubEntry));
      }

      // process directory entries (PkgTreeEntry)
      else if (jsonPkgTree.smartType === 'PkgTreeEntry') {

        // process jsonPkgTree.entry (SmartPallet)
        const jsonSmartPallet = jsonPkgTree.entry;

        // hydrate our pseudoClass MASTERs early
        // ... IMPORTANT: this is the reason we are pre-processing!
        // ... NOTE: pseudoClass MASTERs are never nested,
        //           so there is NO NEED to drill any further deep!
        if (jsonSmartPallet.isPseudoClassMaster) {

          // morph into a real object
          const resolvedObj = hydrateObject(jsonSmartPallet);

          // adorn the .smartClassRef early (normally done by SmartPkg at the end of it's construction)
          // NOTE: SmartClassRef is NOT serializable (because it is NOT a SmartModel derivation)
          resolvedObj.smartClassRef = new SmartClassRef(resolvedObj, pkgIdBeingResolved);

          // catalog this pseudoClassMaster
          // ... optimize hydrateObject() so it doesn't have to resolve preresolved objects twice
          preresolvedObjects.set(jsonSmartPallet, resolvedObj);
          // ... supplements resolveClassRefFromSmartJSON() for self-referencing pseudoClasses
          //     NOTE: for pseudoClassMasters, the id IS the className
          preresolvedPseudoClassMasters.set(resolvedObj.getId(),  resolvedObj);
        }
      }

      // unexpected jsonPkgTree
      // ... defensive only (should never happen)
      else {
        console.warn('SmartModel.fromSmartJSON(smartJson).preresolvePseudoClassMasters(jsonPkgTree) PHASE-1: UNEXPECTED JSON NODE (expecting a PkgTree derivation) ... ', {jsonPkgTree, smartJSON});
      }
    }


    // ***
    // *** PHASE-2: Fully hydrate the entire object
    // *** 

    // top-level invocation, resolving the requested object
    // ... THIS IS IT (the primary return from SmartModel.fromSmartJSON(smartJSON))
    return hydrateObject(smartJSON);

    // our recursive function that fully resolves the requested object
    // RETURNS: the class-based object representing the supplied smartJSON
    function hydrateObject(smartJSON) {

      // handle objects that have been pre-resolved in PHASE-1
      // ... strictly an optimization (we COULD re-hydrate it a second time)
      const preresolvedObject = preresolvedObjects.get(smartJSON);
      if (preresolvedObject) {
        return preresolvedObject;
      }

      // handle NO smartJSON
      // ... simply pass it through (null, undefined, etc. ... even false is OK :-)
      else if (!smartJSON) {
        return smartJSON;
      }

      // handle arrays ... simply recursively decode all array items
      else if (Array.isArray(smartJSON)) {
        return smartJSON.map( item => hydrateObject(item) );
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
            namedProps[key] = hydrateObject(val);
          }

          // determine the classRef (could be a real class or a pseudoClass)
          const classRef = resolveClassRefFromSmartJSON(smartJSON);

          // instantiate a real class-based object using our value-added constructor
          // that handles BOTH real classes and pseudoClasses
          if (!classRef.createSmartObject) {
            debugger;
          }
          return classRef.createSmartObject(namedProps);
        }

        // handle plain NON class-based objects
        // ... simply decode each item recursively
        //     NOTE: This is a hold-over to the OLD SmartPkg.entries (which was a free-formed structure)
        //           TECHNICALLY, it is NOT needed
        //           HOWEVER, it doesn't hurt to keep it
        else {
          const plainObj = Object.entries(smartJSON).reduce( (accum, [subName, subRef]) => {
            accum[subName] = hydrateObject(subRef) ;
            return accum;
          }, {} );
          return plainObj;
        }
      }
      
      // all other types are assumed to be immutable primitives, and simply passed through :-)
      // ... string, number, etc.
      return smartJSON;
    }

  } // end of ... SmartModel.fromSmartJSON(smartJSON)


  /**
   * Create a deep copy of self that is up-to-date with the latest
   * class versioning.
   * 
   * Within this cloning process, object creation is still based on
   * class instantiation.
   * 
   * The hallmark of smartClone() is it is designed to generate deep
   * copies of self that are up-to-date with the latest class
   * versioning.
   *
   * - Class versioning can become out-of-sync when interactive edits
   *   occur to the class master.
   *   
   * - Currently, this is only operational for pseudo classes.  Real
   *   code-based class versioning is not currently tracked, and will
   *   always indicate they are in-sync.
   *
   * INTERNAL NOTE: "two-phase" process
   *
   *   There is a very subtle (and powerful) characteristic of
   *   smartClone() that can be confusing.  When cloning pseudoClass
   *   INSTANCES, we need to pull in characteristics from BOTH
   *   instance state and pseudo-class state.  This is accomplished
   *   through a "two-phase" process, where smartClone() is invoked
   *   twice.
   *
   *   To make sense of this, let's look a Scene object (a
   *   pseudoClass).  A scene INSTANCE can reside in a collage, and if
   *   the scene MASTER is updated, the collage reference to that
   *   scene INSTANCE must be updated.
   *
   *   PHASE 1:
   *    - scene.smartClone() is invoked
   *    - the "instance" properties are accumulated [x,y]
   *      ... these are the translation characteristics of where the
   *          scene instance is placed in the collage
   *      ... this is accomplished based on the dynamics of
   *          this.getEncodingProps()
   *    - the clonedCopy is requested via:
   *      classRef.createSmartObject(namedProps) ... passing {x,y} as namedProps
   *
   *   PHASE 2:
   *    - scene.smartClone({x,y}) is invoked a second time
   *      * because createSmartObject() is processing a pseudoClass, 
   *        it issues another smartClone() request
   *      * IMPORTANT: however, this time self is the pseudoClass MASTER
   *                   NOT the pseudoClass INSTANCE (from Phase 1).
   *      * IMPORTANT: and the overridingNamedProps param includes the
   *                   {x,y} from Phase 1.
   *    - the "class" properties are now accumulated [comps]
   *      ... these are what makes the pseudoClass a class: 
   *          i.e. the components are part of the "Scene" pseudoClass!
   *      ... this is accomplished based on the dynamics of
   *          this.getEncodingProps()
   *    - the clonedCopy is requested via:
   *      classRef.createSmartObject(namedProps) ... passing {x,y,comps} as namedProps
   *      * because the classRef is the "real" Scene class it is instantiate
   *        using `new Scene(...)` semantics
   *      * KOOL: we have accumulated BOTH the appropriate "instance" and "class" properties!!!
   *
   *
   * NOTE: This algorithm is fully implemented within the SmartModel
   *       base class.  With the polymorphic knowledge of which
   *       properties to encode (see getEncodingProps()) it rarely
   *       needs to be overwritten.
   *
   * @param {ObjectLiteral} [overridingNamedProps] - The optional
   * named properties that when supplied will override the members of
   * self that are to be deeply cloned.
   *
   * @returns {smartObject} a deep copy of self that is up-to-date
   * with the latest class versioning.
   */
  smartClone(overridingNamedProps={}) {

    // our type specific handler
    // ... definition is close to usage, but cached for optimization (can be re-used by ANY instance)
    const smartCloneRefHandler = handlerCache.smartCloneRefHandler = handlerCache.smartCloneRefHandler || createTypeRefHandler({
      // pass through null/undefined references
      handleNoRef: (noRef, accumClone) => noRef,
      // pass through primitives ... clone is N/A because they are immutable
      handlePrimitive: (primitiveRef, accumClone) => primitiveRef,
      // encode all array items
      handleArray: (arrRef, accumClone) => arrRef.map( item => smartCloneRefHandler(item) ),
      // encode plain object
      handlePlainObj: (plainObjRef, accumClone) => (
        Object.entries(plainObjRef).reduce( (accum, [subRefName, subRef]) => {
          accum[subRefName] = smartCloneRefHandler(subRef);
          return accum;
        }, {} )
      ),
      // encode SmartObjs smartClone()
      handleSmartObj: (smartObjRef, accumClone) => smartObjRef.smartClone(),
      // UNSUPPORTED: NON SmartObjects (not plain and not smart)
      handleNonSmartObj(otherObjRef, accumClone) {
        throw new Error(`***ERROR*** SmartObject.smartClone() traversal encountered an object reference of unsupported type: ${otherObjRef.constructor.name} :-(`);
      },
      // pass-through classes as-is (i.e. clone is N/A because they are immutable)
      handleClass: (classRef, accumClone) => classRef,
    });

    // clone self's properties by recursively drilling through entire tree with depth
    // ... recursion is handled by our internal smartCloneRefHandler() function
    const clonedProps = this.encodingPropsReduce( (accumProps, propName, propValue, defaultValue) => {

      // clone each prop ONLY if it is not specified in our overridingNamedProps param
      if ( !overridingNamedProps.hasOwnProperty(propName) ) {
        const clonedValue    = smartCloneRefHandler(propValue); // clone our propValue
        accumProps[propName] = clonedValue;                     // accumulate our running clonedProps
      }
      return accumProps;

    }, {}/*initialAccum*/);

    // accumulate all namedProps for our constructor
    // ... overridingNamedProps param take precedence
    //     -and- supports overrides that are NOT part of our instance members
    const namedProps = {...clonedProps, ...overridingNamedProps};
    // console.log(`xx ${this.diagClassName()}.smartClone() instantiating new object with following params:\n`, {clonedProps, overridingNamedProps, namedProps});

    // instantiate a new copy of self (our cloned copy)
    // NOTE: Our entire cloning and persistance architecture is based on
    //       SmartModel constructors using named parameters!
    // NOTE: We must use classRef.createSmartObject() to get the
    //       correct result (picking up the correct instance
    //       state and class state)
    //       NOT: new this.constructor(namedProps)
    //            ... see: "two-phase" NOTE (in self's JavaDoc)
//  const clonedCopy = new this.constructor(namedProps);                 // NO
    const clonedCopy = this.getClassRef().createSmartObject(namedProps); // YES

    // that's all folks :-)
    return clonedCopy;
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
//*** Internal Helpers
//******************************************************************************

/**
 * A static cache of all `createTypeRefHandler()` functions.  These
 * functions can be re-used for ANY SmartObject instance.  This cache
 * is used to support the preference of creating the functions in-line
 * (so as to live close to the usage code).
 */
const handlerCache = {
  // [functName]: function,
  // ...
};
