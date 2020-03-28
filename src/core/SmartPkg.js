import SmartModel        from './SmartModel';
import SmartClassRef     from './SmartClassRef';
import PseudoClass       from './PseudoClass';
import {isPlainObject,
        isClass}         from 'util/typeCheck';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
// import {changeManager}   from 'features'; // ?? ReferenceError: Cannot access 'SmartPallet' before initialization
import changeManager     from 'features/common/changeManager/changeManager'; // ?? BETTER

/**
 * SmartPkg models visualize-it packages.
 *
 * SmartPkgs:
 *   - are cataloged by pkgManager
 *     ... the basis resolving classRefs in our persistence model
 *   - and optionally viewed in the LeftNav
 *     ... the basis of the builder app management (viewing/editing
 *         entries, including entries in other entries, etc.)
 *     ... LeftNav exposure is optional because some packages are NOT visual
 *         (such as "core") ... just needed for pkgManager promotion
 *
 * SmartPkg is a concrete class that can model ANY visualize-it package:
 *   - a component package (holding component definitions)
 *   - a system package (holding scenes and collages)
 *   - even a hybrid package (combining both component and system resources)
 *
 * A SmartPkg can represent EITHER:
 *   - code-based packages (containing class references)
 *     * NOT editable (unless we decide to dynamically manage and persist code)
 *     * NOT persistable ... save/retrieve (ditto)
 *   - resource-based packages (with NO class references)
 *     * editable
 *     * persistable ... save/retrieve
 *
 * Entries from one package can have dependencies on other external
 * packages (for example, a "system" package may contain component
 * instances from classes defined in a "component" package).
 *
 * All SmartPkgs have an ID (pkgId):
 *   - the ID qualifies the package through which classRefs are distributed
 *     * so the pkgId belongs to classRefs ONLY, NOT entries
 *       ... because entries are NOT shared across packages
 *     * SmartPkg will auto-inject it's package ID in all classRefs
 *       it contains!
 *       - this allows our persistence process to record BOTH the
 *         pkgId and className from which each object is
 *         instantiated
 *         ... allowing it to be re-hydrated (because we can locate the
 *             class - via pkgManager)
 *   - object instances contained in a package can be based on classes
 *     from external packages (i.e. dependent packages)
 *     ... this point is more related to persistence characteristic
 *         (not so much dealing with SmartPkg itself)
 *     * typically top-level objects are from the core package, which
 *       is globally available (however that is a minor point)
 *     * in addition, objects can be instances of classes defined
 *       within the same package (as you would expect)
 *   - SO IN SUMMARY: the distinction between "classRef" and "object instance":
 *     * "instances" ALWAYS belong to the "self-contained" package
 *     * "instances" can be created from types that belong to either self's package or "other" packages
 *
 * SmartPkg entries are defined in an object structure (with depth)
 * that represents the visual hierarchy by which they are promoted.
 *   - entries utilize an object structure (with depth)
 *   - any client-defined structure is supported (i.e. a collection of
 *     whatever with arbitrary nesting of named nodes)
 *   - named nodes (contained in plain objects) represent a logical directory
 *     * where the name is a displayed human readable node
 *     * and can be nested (supporting sub-structure depth)
 *   - arrays represent resource items (or nested named nodes)
 *     * entries can be:
 *       1. smartObject to view/use
 *          ```
 *          can be:
 *          - Classes ... SingleValve, TwoWayValve, etc. (NOT SUPPORTED BY RESOURCE-BASED PKG)
 *          - SmartModel instance obj ... Collage
 *          - SmartModel pseudoClass
 *            * pseudoClass Master ...... DynamicComp, Scene, 
 *            * pseudoClass INSTANCE .... comp instances IN Scene -or- scene instances in Collage
 *          ```
 *       2. plain object representing nested sub-entries mixed into the
 *          entries array
 *
 * Here is a sample `entries`:
 * ```js
 * entries: {
 *   components: {
 *     valves: [
 *       // ... example of class (i.e. a class function) ... NOT supported by a resource-based pkg
 *       SingleValve,
 *       TwoWayValve,
 *
 *       // ... example of Pseudo Class MASTER (a DynamicComp(), dynamically editable)
 *       DynamicComp({withPseudoClassName, andOthers}),
 *     ],
 *     pumps: [
 *       PowerPump,
 *       { // ... nested sub-entries mixed into the entries array
 *         "Pumps Cat 2": [
 *           SubPump1,
 *           SubPump2,
 *         ],
 *       },
 *       SumpPump,
 *     ],
 *   },
 *   scenes: [
 *     // ... a pseudoClass MASTER (can be edited: the comps add/remove/position/transform)
 *     Scene(...comps),
 *     Scene(...comps),
 *     ...
 *   ],
 *   collages: [
 *     // ... collage instance that holds scene instances (pseudoClass INSTANCEs)
 *     //      - VERY TRUE: scene instances will hold their unique x/y offsets
 *     //      - Collage MUST validate that scene instances are used
 *     //        ?? TODO: make this so (even though it is tightly controlled, wouldn't hurt to validate it)
 *     //      - IMPORTANT: to resolve this, MUST FIRST resolve Scene pseudoClass MASTER
 *     //        ... because it is referenced in the same pkg!
 *     Collage(...scenes)
 *     Collage(...scenes)
 *     ...
 *   ],
 * }
 * ```
 *
 * SmartPkg entries are promoted through two internal catalogs,
 * providing easy access independent of the visual hierarchy (i.e. the
 * visual structure with depth).  The two catalogs are:
 * 
 * ```
 *  + getClassRef(className): SmartClassRef ... used by pkgManager
 *  + getPkgEntry(entryId):   entry         ... used by ?? suspect needed for pseudoClass modification sync in other PkgEntries
 * ```
 */
export default class SmartPkg extends SmartModel {

  /**
   * Create a SmartPkg.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this SmartPkg
   * (i.e. the package ID).  Because this must be fully unique
   * across all other in-memory packages, it is recommended to use a
   * "java like" package name (ex: com.astx.acme).
   * @param {string} [name=id] - The SmartPkg name.
   * @param {Object} [entries] - the optional entries held in self (see class notes).
   */
  constructor({id, name, entries={}, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartPkg() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... entries
    check(entries,                 'entries is required');
    check(isPlainObject(entries),  'entries must be a plain object (with depth)');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    this.entries = entries;

    // remaining logic
    // ... hook into the standard SmartModel.constructorConfig()
    //     so this will be accomplished in pseudo construction too!
    // ?? DO THIS -and- call it in our pseudo construction

    // initialize our catalogs
    this.initializeCatalogs(this.entries);

    // introduce the value-added meta API to all our classes (including package registration)
    this.adornContainedClasses();

    // mark our top-level entries as PkgEntries
    Object.values(this._entryCatalog).forEach( (entry) => {
      entry.markAsPkgEntry(); // ... internally markAsPkgEntry() will register them to changeManager
    });

    // reset the baseline crc throughout our containment tree
    this.resetBaseCrc();

    // register self's (SmartPkg) state to changeManager
    changeManager.registerEPkg(this);

    // console.log(`xx HERE IS A SmartPkg: `, this);
  }

  // support persistance by encoding needed props of self
  getEncodingProps(forCloning) {
    return [...super.getEncodingProps(forCloning), ...['entries']];
  }

  /**
   * Return self's package ID (ex: 'com.astx.acme').
   */
  getPkgId() {
    return this.id;
  }

  /**
   * Return self's package name (ex: 'ACME System').
   */
  getPkgName() {
    return this.name;
  }

  /**
   * Return self's pkgResourcePath (if any).
   * 
   * When a SmartPkg is persisted (i.e. pulled from, or saved to a
   * file/url), it will contain a pkgResourcePath.
   * - this merely identifies it's persistent form and provides a
   *   convenient means by which changes can be saved
   * 
   * NOTE: The `pkgResourcePath` attribute is NOT persisted, rather
   *       it is retained as a result of an open/save operation
   *       (see: pkgPersist.js open/save operators).
   *
   * @returns {PkgResourcePath} the pkgResourcePath (if any),
   * undefined for none.
   */
  getPkgResourcePath() {
    return this.pkgResourcePath;
  }

  /**
   * Return an indicator as to whether this package can be persisted.
   * 
   * NOTE: Packages that contain code cannot be persisted.
   *
   * @returns {boolean} true: can persist, false otherwise.
   */
  canPersist() {
    return !this.entriesContainCode;
  }

  /**
   * Set self's pkgResourcePath (see notes in getPkgResourcePath()).
   *
   * @param {PkgResourcePath} pkgResourcePath - the resource path
   * where self is persisted.
   */
  setPkgResourcePath(pkgResourcePath) {
    this.pkgResourcePath = pkgResourcePath;
  }

  /**
   * An internal method that recurses through self's entries,
   * initializing our two catalogs.
   *
   * @param {Object} entry - the current entry node being processed.
   */
  initializeCatalogs(entry) {

    // reset our catalogs on the top-level invocation
    if (entry === this.entries) {
      this._classRefCatalog = {};
      this._entryCatalog    = {};

      // prime our indicator as to whether our content contains code
      // ... used in determining if this package can be persisted
      //     (see: `canPersist()`).
      this.entriesContainCode = false; // ... start out assuming NO code
    }

    // recurse over entry
    // ... for plain objects, each member is a directory node
    if (isPlainObject(entry)) {
      // pass through through all directory nodes (object members),
      // ... and recurse into each
      for (const dirName in entry) {
        const dirContent = entry[dirName];
        this.initializeCatalogs(dirContent);
      }
    }
    // ... for array entry,
    else if (Array.isArray(entry)) {
      entry.forEach( (arrItem) => {

        // normally this is a smartObj
        if (arrItem instanceof SmartModel) {
          const smartObj = arrItem;

          // catalog any pseudoClasses in our _classRefCatalog
          if (PseudoClass.isPseudoClassMaster(smartObj)) {
            const className = PseudoClass.getClassName(smartObj);
            this._classRefCatalog[className] = smartObj;
          }

          // catalog all entries in our _entryCatalog
          this._entryCatalog[smartObj.id] = smartObj; // ??!! should entries contain real classes too (they do contain pseudo classes)

          // maintain our parentage
          smartObj.setParent(this);
        }

        // can be a real class reference
        else if (isClass(arrItem)) { // ??!! specific to real class
          const realClass = arrItem;

          // mark our package as containing code
          this.entriesContainCode = true;

          // catalog classes in our _classRefCatalog
          const className = PseudoClass.getClassName(realClass);
          this._classRefCatalog[className] = realClass;

          // AI: most likely we need to register SOMETHING from a class in our this._entryCatalog (as is done for PseudoClassMaster above)
        }

        // can be a nested sub-directory (mixed in with our tab activation entries)
        else if (isPlainObject(arrItem)) {
          this.initializeCatalogs(arrItem);
        }

        // other items are NOT supported (should not happen - defensive only)
        else {
          const errMsg = '***ERROR*** SmartPkg.initializeCatalogs() found UNSUPPORTED array entry ... must be a smartObj or class or plain nested directory object ... see logs for entry';
          console.error(errMsg, {arrItem});
          throw new Error(errMsg);
        }
      });
    }

    // ... other entries are NOT supported (should not happen - defensive only)
    else {
      const errMsg = '***ERROR*** SmartPkg.initializeCatalogs() found UNSUPPORTED entry ... must be a plain directory object or an array of smartObjs ... see logs for entry';
      console.error(errMsg, {entry});
      throw new Error(errMsg);
    }
  }


  /**
   * Introduce the `.smartClassRef` on all our classes, providing
   * value-added utility that unifies the meta API for both real
   * classes and pseudoClasses.
   *
   * It also ties this package to the each class for the first time
   * (registering self's package ID)!
   */
  adornContainedClasses() {
    Object.values(this._classRefCatalog).forEach( (clazz) => {
      // ?? what do we do if this clazz is already registered to some other package?
      clazz.smartClassRef = new SmartClassRef(clazz, this.getPkgId());
    });
  }

  /**
   * Return self's classRef matching the supplied `className` (undefined for
   * not-found).
   *
   * NOTE: This method is a key aspect that makes pkgManager work.
   *
   * @param {string} className - the class name of the classRef to return.
   *
   * @returns {SmartClassRef} the classRef matching the supplied `className`
   * (undefined for not-found).
   */
  getClassRef(className) {
    // NOTE: To avoid name clash with SmartModel.getClassRef(), 
    //       an unrelated method to ours:
    //       - we redirect to it based on the distinct param signature!!
    //       - I really wanted to use this "getClassRef" in both cases
    //       - This is analogous to "Static Polymorphism" in Java/C++,
    //         where the entire method signature is employed in it's
    //         polymorphic behavior :-)
    if (arguments.length === 0) {
      return super.getClassRef();
    }

    // this methods real implementation :-)
    return this._classRefCatalog[className].smartClassRef;
  }

  /**
   * Return the entry matching the supplied `entryId` (undefined for
   * not-found).
   *
   * NOTE: This method is a key aspect that integrates with the
   *       visuals (displayed in the tab manager).
   *       HOWEVER however it is currently not needed.
   *       ... as of 2/16/2020, this method NOT being used.
   *
   * @param {string} entryId - the entry ID of the entry to return.
   *
   * @returns {entry} the entry matching the supplied `entryId`,
   * undefined for not-found.
   */
  getPkgEntry(entryId) {
    return this._entryCatalog[entryId];
  }

  /**
   * A static method that reconstitutes SmartPkg objects from
   * smartJSON.
   *
   * NOTE: This is specialized logic (from SmartModel.fromSmartJSON()),
   *       because it must FIRST resolve pseudoClass MASTER
   *       definitions, in support of self-referencing pseudoClasses
   *       (ex: collage referencing scene instances)
   * 
   * @param {JSON} smartJSON - the smartJSON structure representing
   * the SmartPkg object to rehydrate.
   *
   * @returns {SmartPkg} a newly instantiated SmartPkg object from the
   * supplied smartJSON.
   *
   * @throws {Error} an Error is thrown in various scenarios
   * (unresolved class references, invalid params, etc.).
   */
  // ?? when complete, determine if this logic can (or should) be implemented in SmartModel
  static fromSmartJSON(smartJSON) {

    // validate supplied parameters
    const check = verify.prefix('SmartPkg.fromSmartJSON(smartJSON) parameter violation: ');

    // ... smartJSON
    check(smartJSON,                 'smartJSON is required');
    check(isPlainObject(smartJSON),  'smartJSON must be a JSON object');
    check(smartJSON.smartType === 'SmartPkg',
          `smartJSON does NOT represent a SmartPkg object, rather a ${smartJSON.smartType} object.`);

    //***
    //*** PHASE-1: pre-process the smartJSON to resolve pseudoClass MASTER definitions
    //*** ... in support of self-referencing pseudoClasses
    //***     (ex: collage referencing scene instances)
    //***

    // NOTE: We currently mutate smartJSON with real objects (resolving pseudoClass MASTER TYPEs).
    //       While this should work, may want to consider making a copy.

    // the catalog of pseudoClass MASTERs (supporting the extraClassResolver)
    const pseudoClassMasters = {};

    // retain the pkgId being resolved (used in our extraClassResolver)
    // ... NOTE: for SmartPkg JSON, the top-level id IS the package ID
    //           see: getPkgId()
    const pkgIdBeingResolved = smartJSON.id;

    // our recursive function that performs the pre-processing
    function resolvePseudoClassMasters(jsonEntry) {

      // entry is a plain JSON object
      if (isPlainObject(jsonEntry)) {

        // entry is a smartObject
        if (jsonEntry.smartType) {

          // hydrate our pseudoClass MASTERs early
          // ... IMPORTANT: this is the reason we are pre-processing!
          // ... NOTE: All our pseudoClass MASTER will appear in the root of any entries directory!
          //           In other words, no need to drill any further deep!
          if (jsonEntry.isPseudoClassMaster) {

            // morph into a real object
            const resolvedObj = SmartModel.fromSmartJSON(jsonEntry); // ... no need for extraClassResolver (pseudoClass Masters resolve via core classes)

            // adorn the .smartClassRef early (normally done by SmartPkg at the end of it's construction)
            resolvedObj.smartClassRef = new SmartClassRef(resolvedObj, pkgIdBeingResolved);

            // catalog in pseudoClassMasters
            pseudoClassMasters[resolvedObj.id] = resolvedObj;


            // pass it through
            // ... see note on "mutate smartJSON with real objects" (above)
            return resolvedObj;
          }
          
          // pass ALL OTHER smartObjects through (JSON as-is)
          // ... things like:
          //     - pseudoClass INSTANCEs
          //     - other SmartClasses (should NEVER happen in our entries structure
          // ... this will be processed in PHASE-2
          else {
            return jsonEntry;
          }
        }

        // entry is a plain JSON object
        else {
          // recursively pass through through all object members
          for (const key in jsonEntry) {
            const oldVal = jsonEntry[key];
            const newVal = resolvePseudoClassMasters(oldVal);
            jsonEntry[key] = newVal; // potential mutation
          }
          return jsonEntry;
        }
      }

      // entry is an array
      else if (Array.isArray(jsonEntry)) {
        // recursively pass through through all array items
        for (let i=0; i<jsonEntry.length; i++) {
          const oldVal = jsonEntry[i];
          const newVal = resolvePseudoClassMasters(oldVal);
          jsonEntry[i] = newVal; // potential mutation
        }
        return jsonEntry;
      }

      // entry is a JavaScript class
      // ... should NOT find this in resource-based pkgs (simply defensive)
      else if (isClass(jsonEntry)) {
        // pass it through
        console.warn('SmartPkg.fromSmartJSON(smartJson).resolvePseudoClassMasters(jsonEntry) PHASE-1: NOT expecting to pass through (class) ... ', {jsonEntry, smartJSON});
        return jsonEntry;

      }

      // handle anything else
      // ... primitives
      // ... should NOT happen within our entries structure
      else {
        // pass it through
        console.warn('SmartPkg.fromSmartJSON(smartJson).resolvePseudoClassMasters(jsonEntry) PHASE-1: NOT expecting to pass through (primitive) ... ', {jsonEntry, smartJSON});
        return jsonEntry;
      }

    }

    // resolve the pseudoClass MASTER definitions (within the smartJSON)
    resolvePseudoClassMasters(smartJSON.entries);
    

    //***
    //*** PHASE-2: hydrate the entire object
    //*** ... now that we have resolved the pseudoClass MASTER definitions
    //***

    // utilize an extraClassResolver that can resolve self-referencing pseudoClasses
    // ... ex: collage referencing scene instances
    function extraClassResolver(pkgId, className) {
      const clazz = (pkgId === pkgIdBeingResolved) ? pseudoClassMasters[className] : undefined;
      //console.log(`xx TEMP ... in extraClassResolver(pkgId:'${pkgId}', className:'${className}') ... comparing pkgIdBeingResolved:'${pkgIdBeingResolved}'` +
      //            ` >>> ${clazz ? 'FOUND IT' : 'NOT FOUND'} ... pseudoClassMasters: `, pseudoClassMasters);

      return clazz ? clazz.smartClassRef : undefined;
    }

    // use the normal SmartModel.fromSmartJSON() to do this work
    // ... this passes through any objects that are already hydrated in our smartJSON
    try {
      const hydratedObj = SmartModel.fromSmartJSON(smartJSON, extraClassResolver);
      return hydratedObj;
    }
    catch(err) {
      // add additional context to reveal any errors resolving THIS SmartPkg
      throw err.defineAttemptingToMsg(`hydrate SmartPkg '${pkgIdBeingResolved}'`);
    }
  }

}
SmartPkg.unmangledName = 'SmartPkg';
