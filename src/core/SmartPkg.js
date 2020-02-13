import SmartModel        from './SmartModel';
import {isPlainObject,
        isClass}         from 'util/typeCheck';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * SmartPkg encapsulates a visualize-it run-time package.
 *
 * It is a concrete class that can model ANY visualize-it package:
 * - a component package (holding component definitions)
 * - a system package (holding scenes and collages)
 * - even a hybrid package (combining both component and system resources)
 *
 * A SmartPkg can represent EITHER:
 * - code-based packages (containing class references)
 *   * NOT editable (unless we decide to dynamically manage and persist code)
 *   * NOT persistable ... save/retrieve (ditto)
 * - resource-based packages (with NO class references)
 *   * editable
 *   * persistable ... save/retrieve
 *
 * SmartPkg entries are defined in an object structure (with depth)
 * that represents the visual hierarchy by which they are promoted.
 * - entries utilize an object structure (with depth)
 * - any client-defined structure is supported (i.e. a collection of
 *   whatever with arbitrary nesting of named nodes)
 * - named nodes (contained in plain objects) represent a logical directory
 *   * where the name is a displayed human readable node
 *   * and can be nested (supporting sub-structure depth)
 * - arrays represent resource items (or nested named nodes)
 *   * entries can be:
 *     1. smartObject to view/use
 *        ```
 *        can be:
 *        - Classes ... SingleValve, TwoWayValve, etc. (NOT SUPPORTED BY RESOURCE-BASED PKG)
 *        - SmartModel instance obj ... Collage
 *        - SmartModel pseudoClass
 *          * pseudoClass Master ...... DynamicComp, Scene, 
 *          * pseudoClass INSTANCE .... comp instances IN Scene -or- scene instances in Collage
 *        ```
 *     2. plain object representing nested sub-entries mixed into the
 *        entries array
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
 *  + getClassRef(className, pkgName): classRef ... used by pkgManager
 *  + getEntry(entryId, pkgName): entry         ... used by tabManager
 * ```
 */
export default class SmartPkg extends SmartModel {

  /**
   * Create a SmartPkg.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this SmartPkg
   * (logically the package name).  Because this must be fully unique
   * across all other in-memory packages, it is recommended to use a
   * "java like" package name (ex: com.astx.acme).
   * @param {string} [name=id] - The SmartPkg name (logically the package desc).
   * @param {Object} [entries] - the optional entries held in self (see class notes).
   */
  constructor({id, name, entries={}, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartPkg() constructor parameters
    const check = verify.prefix(`${this.getMyClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... entries
    check(entries,                 'entries is required');
    check(isPlainObject(entries),  'entries must be a plain object (with depth)');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    this.entries = entries;

    // initialize our catalogs
    this.initializeCatalogs(this.entries);
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['entries']];
  }

  /**
   * Return self's package name (ex: 'com.astx.acme').
   * NOTE: This is derived from self's id.
   */
  getPkgName() {
    return this.id;
  }

  /**
   * Return self's package description (ex: 'ACME System').
   * NOTE: This is derived from self's name.
   */
  getPkgDesc() {
    return this.name;
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
    }

    // ?? L8TR: we may want to set a top-level state: entriesContainCode (so we know we can't persist)
    // ... ? would need to be checked in: SmartPkg.fromSmartJSON()
    // ... ? without this check, how would it error out (with classes)

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
          if (SmartModel.isPseudoClass(smartObj)) {
            const className = SmartModel.getClassName(smartObj);
            this._classRefCatalog[className] = smartObj;
          }

          // catalog all entries in our _entryCatalog
          this._entryCatalog[smartObj.id] = smartObj;
        }

        // can be a real class reference
        else if (isClass(arrItem)) {
          const realClass = arrItem;
         
          // catalog classes in our _classRefCatalog
          const className = SmartModel.getClassName(realClass);
          this._classRefCatalog[className] = realClass;
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
   * Return the classRef matching the supplied params (undefined for
   * not-found).
   *
   * NOTE: This method is a key aspect that makes pkgManager work.
   *
   * @param {string} className - the class name of the classRef to return.
   * @param {string} pkgName - the package name that the class belongs to.
   *
   * @returns {classRef} the classRef matching the supplied params
   * (either a real class or a pseudoClass), undefined for not-found.
   */
  getClassRef(className, pkgName) { // AI: do we assume that pkgName is already resolved to this SmartPkg, and NOT pass it in here
    // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
    //? return (pkgName === this.getPkgName()) ? this._classRefCatalog[className] : undefined;
    return this._classRefCatalog[className];
  }

  /**
   * Return the entry matching the supplied params (undefined for
   * not-found).
   *
   * NOTE: This method is a key aspect that integrates with the
   *       visuals (displayed in the tab manager).
   *
   * @param {string} entryId - the entry ID of the entry to return.
   * @param {string} pkgName - the package name that the entry belongs to.
   *
   * @returns {entry} the entry matching the supplied params,
   * undefined for not-found.
   */
  getEntry(entryId, pkgName) { // AI: do we assume that pkgName is already resolved to this SmartPkg, and NOT pass it in here
    // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
    //? return (pkgName === this.getPkgName()) ? this._entryCatalog[entryId] : undefined;
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
    const check = verify.prefix(`${SmartModel.getClassName(this)}.fromSmartJSON(smartJSON) parameter violation: `);

    // ... smartJSON
    check(smartJSON,                 'smartJSON is required');
    check(isPlainObject(smartJSON),  'smartJSON must be a JSON object');
    check(smartJSON.smartType === SmartModel.getClassName(this),
          `smartJSON does NOT represent a ${SmartModel.getClassName(this)} object, rather a ${smartJSON.smartType} object.`);


    //***
    //*** PHASE-1: pre-process the smartJSON to resolve pseudoClass MASTER definitions
    //*** ... in support of self-referencing pseudoClasses
    //***     (ex: collage referencing scene instances)
    //***

    // NOTE: We currently mutate smartJSON.
    //       While this should work, may want to consider making a copy.

    // the catalog of pseudoClass MASTERs (supporting the extraClassResolver)
    const pseudoClassMasters = {};

    // our recursive function that performs the pre-processing
    function resolvePseudoClassMasters(jsonEntry) {

      // entry is a plain JSON object
      if (isPlainObject(jsonEntry)) {

        // entry is a smartObject
        if (jsonEntry.smartType) {

          // handle pseudoClass MASTER TYPE
          // ... IMPORTANT: this is the reason we are pre-processing!
          // ... NOTE: All our pseudoClass MASTER will appear in the root of any entries directory!
          //           In other words, no need to drill any further deep!
          if (SmartModel.isPseudoClass(jsonEntry)) {
            // morph into a real object
            const resolvedObj = SmartModel.fromSmartJSON(jsonEntry);

            // catalog in pseudoClassMasters
            pseudoClassMasters[resolvedObj.id] = resolvedObj;

            // pass it through
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

      // entry is a JavaScript classes
      // ... should NOT find this in resource-based pkgs (simply defensive)
      else if (SmartModel.isClass(jsonEntry)) {
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
    function extraClassResolver(className, pkgName) {
      // ?? L8TR: when pkgName is used
      //? return (pkgName === this.getPkgName()) ? pseudoClassMasters[className] : undefined;
      // ?? temp (without pkgName)
      return pseudoClassMasters[className];
    }

    // use the normal SmartModel.fromSmartJSON() to do this work
    // ... this passes through any objects that are already hydrated in our smartJSON
    const hydratedObj = SmartModel.fromSmartJSON(smartJSON, extraClassResolver);

    // beam me up scotty :-)
    return hydratedObj;
  }

}
SmartPkg.unmangledName = 'SmartPkg';
