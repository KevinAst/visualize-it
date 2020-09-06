import SmartModel        from './SmartModel';
import SmartClassRef     from './SmartClassRef';
import PseudoClass       from './PseudoClass';
import SmartPallet       from './SmartPallet';
import {ChangeManager}   from './changeManager';
import {isString,
        isArray}         from '../util/typeCheck';
import verify            from '../util/verify';
import checkUnknownArgs  from '../util/checkUnknownArgs';

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
 * SmartPkg entries are held in a directory structure (with depth),
 * representing a visual hierarchy by which they are promoted for
 * human consumption.  This is defined through the PkgTree class, with
 * directories (a PkgTreeDir derivation) and entries (a PkgTreeEntry
 * derivation). Please refer to `src/sandbox` for some samples:
 *  - generalComps.js
 *  - konvaSandboxSmartPkg.js
 *
 * SmartPkg entries are promoted through two internal catalogs,
 * providing easy access independent of the visual directory.
 * The two catalogs are:
 * 
 * ```
 *  + getClassRef(className): SmartClassRef ... used by pkgManager in it's low-level promotion of class definitions
 *  + getPkgEntry(entryId):   entry         ... not currently used - suspect may be needed for pseudoClass modification sync in other PkgEntries
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
   * @param {string} [name=id] - The SmartPkg name (for human consumption).
   * @param {PkgTreeDir} [rootDir=emptyDir] - the optional root
   * directory containing the entries of this SmartPkg.
   */
  constructor({id, name, rootDir=new PkgTreeDir({name:'/'}), ...unknownArgs}={}) {
    super({id, name});

    // validate SmartPkg() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... rootDir
    check(rootDir,                       'rootDir is required');
    check(rootDir instanceof PkgTreeDir, 'rootDir must be a PkgTreeDir');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    this.rootDir = rootDir;

    // maintain our parentage
    this.rootDir.setParent(this);

    // remaining logic
    // ... hook into the standard SmartModel.constructorConfig()
    //     so this will be accomplished in pseudo construction too!
    // ?? DO THIS -and- call it in our pseudo construction

    // initialize our catalogs
    this.initializeCatalogs(this.rootDir);

    // introduce the value-added meta API to all our classes (including package registration)
    this.adornContainedClasses();

    // mark our top-level entries as PkgEntries
    Object.values(this._entryCatalog).forEach( (entry) => {
      entry.markAsPkgEntry(); // ... internally markAsPkgEntry() will register them to changeManager
    });

    // register self (EPkg/SmartPkg) to changeManager
    // this maintains our this.changeManager linkage
    new ChangeManager(this);

    // reset the baseline crc throughout our containment tree
    this.resetBaseCrc();

    // console.log(`xx HERE IS A SmartPkg: `, this);
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['rootDir']];
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

  // change isaPkg() to indicate we are SmartPkg instances
  isaPkg() {
    return true;
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
   * Set self's pkgResourcePath (see notes in getPkgResourcePath()).
   *
   * @param {PkgResourcePath} pkgResourcePath - the resource path
   * where self is persisted.
   */
  setPkgResourcePath(pkgResourcePath) {
    this.pkgResourcePath = pkgResourcePath;
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
   * An internal method that recurses through self's entries,
   * initializing our two catalogs.
   *
   * @param {PkgTree} treeNode - the current node in our directory
   * being processed.
   *
   * @private
   */
  initializeCatalogs(treeNode) {

    // reset our catalogs on the top-level invocation
    if (treeNode === this.rootDir) {
      this._classRefCatalog = {}; // key: className,   value: smartObj (a PseudoClassMaster) -OR- a raw class
      this._entryCatalog    = {}; // key: smartObj.id, value: smartObj

      // prime our indicator as to whether our content contains code
      // ... used in determining if this package can be persisted
      //     (see: `canPersist()`).
      this.entriesContainCode = false; // ... start out assuming NO code
    }

    // for PkgTreeDirs, recurse into each node
    if (treeNode.isDir()) {
      const dirEntries = treeNode.getChildren();
      dirEntries.forEach( (subNode) => this.initializeCatalogs(subNode) );
    }

    // for PkgTreeEntries, catalog them (covering BOTH entries and classes)
    else if (treeNode.isEntry()) {
      const smartPallet = treeNode.getEntry(); // ... Scene/Collage/CompRef

      // ***
      // *** catalog entries
      // ***

      this._entryCatalog[smartPallet.getId()] = smartPallet;


      // ***
      // *** catalog classes
      // ***
  
      // both pseudo classes
      if (PseudoClass.isPseudoClassMaster(smartPallet)) { // ex: Scene (master)
        const pseudoClass = smartPallet;

        const className = PseudoClass.getClassName(pseudoClass);
        this._classRefCatalog[className] = pseudoClass;
      }

      // and real classes
      else if (smartPallet.getCompInstance) { // isA CompRef
        // components are their own proprietary class ... AI: must account for DynamicComp (once implemented)
        const comp      = smartPallet.getCompInstance();
        const realClass = comp.constructor;

        // mark our package as containing code
        this.entriesContainCode = true;

        // catalog classes in our _classRefCatalog
        const className = PseudoClass.getClassName(realClass);
        this._classRefCatalog[className] = realClass;
      }
    }
  }

  /**
   * An internal method that introduces the `.smartClassRef` on all our classes, providing
   * value-added utility that unifies the meta API for both real
   * classes and pseudoClasses.
   *
   * This process ties self's package to the each class for the first time
   * (registering self's package ID)!
   *
   * @private
   */
  adornContainedClasses() {
    Object.values(this._classRefCatalog).forEach( (clazz) => { // clazz can be 1. smartObj (a PseudoClassMaster), or 2. a raw class
      // AI: ?? what do we do if this clazz is already registered to some other package?
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
   * NOTE: Currently (as of 8/25/2020(, this method NOT being used.
   *       >>> suspect may be needed for pseudoClass modification sync in other PkgEntries
   *
   * @param {string} entryId - the entry ID of the entry to return.
   *
   * @returns {PkgEntry} the entry matching the supplied `entryId`,
   * `undefined` for not-found.
   */
  getPkgEntry(entryId) {
    // NOTE: To avoid name clash with SmartModel.getPkgEntry(), 
    //       an unrelated method to ours:
    //       - we redirect to it based on the distinct param signature!!
    //       - I really wanted to use this "getPkgEntry" in both cases
    //       - This is analogous to "Static Polymorphism" in Java/C++,
    //         where the entire method signature is employed in it's
    //         polymorphic behavior :-)
    //       - NOTE: I do NOT believe this is required, due to the natural
    //               invocation pattern however, we do it for good measure.
    if (arguments.length === 0) {
      return super.getPkgEntry();
    }

    // this methods real implementation :-)
    return this._entryCatalog[entryId];
  }

}
SmartPkg.unmangledName = 'SmartPkg';



/**
 * A tree-based structure cataloging entries and directories (with
 * depth) of a SmartPkg.
 */
class PkgTree extends SmartModel {

  /**
   * Self's PkgTree name, visualized in UI.
   * NOTE: Technically this API is promoted by SmartModel, and will work (since
   *       the correct name is promoted to SmartModel), HOWEVER this implementation 
   *       is MORE explicit!
   * @returns {string} the PkgTree node name (for human consumption).
   */
  getName() {
    throw new Error(`***ERROR*** PkgTree interface-violation: ${this.diagClassName()}.getName() is an abstract method that MUST BE implemented!`);
  }

  /**
   * The children of self (for Dir nodes).
   * @returns {PkgTree[] | undefined} the children of self's Dir node (undefined for Entry node).
   */
  getChildren() {
    return undefined; // default implementation is: NO children
  }

  /**
   * Self's entry (for Entry nodes).
   * @returns {SmartPallet | undefined} self's Entry node (undefined for Dir nodes).
   */
  getEntry() {
    return undefined; // default implementation is: NO entry
  }

  /**
   * Indicator as to whether self is a PkgTree Dir node (i.e. a PkgTreeDir).
   * @returns {boolean} true: PkgTreeDir, false: PkgTreeEntry
   */
  isDir() {
    return this.getChildren() ? true : false;
  }

  /**
   * Indicator as to whether self is a PkgTree Entry node (i.e. a PkgTreeEntry).
   * @returns {boolean} true: PkgTreeEntry, false: PkgTreeDir
   */
  isEntry() {
    return !this.isDir();
  }
}
PkgTree.unmangledName = 'PkgTree';



/**
 * A PkgTree derivation modeling named directories.
 */
export class PkgTreeDir extends PkgTree { // ... a directory of PkgTree entries (PkgTree[])

  /**
   * Create a PkgTreeDir.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} name - the name of this directory (for human consumption).
   * @param {PkgTree[]} [entries] - the optional entries of this directory.
   */
  constructor({name, entries=[], ...unknownArgs}={}) {
    super({id: name, name});

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}(name:'${name}') constructor parameter violation: `);
    // ... name
    check(name,             'name is required');
    check(isString(name),   'name must be a string');
    // ... entries
    check(isArray(entries), 'entries must be an array (when supplied)');
    entries.forEach((entry) => check(entry instanceof PkgTree, 'entries must be a PkgTree[] array'));
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.name    = name;
    this.entries = entries;

    // maintain our parentage
    this.entries.forEach( (pkgTree) => pkgTree.setParent(this) );
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    // because our id is derived from the supplied name, we do not want our base class encoding
    // NO:
//  return [...super.getEncodingProps(), ...['name', 'entries']];
    // YES:
    return ['name', 'entries'];
  }

  /**
   * Self's PkgTree name, visualized in UI.
   * NOTE: Technically this API is promoted by SmartModel, and will work (since
   *       the correct name is promoted to SmartModel), HOWEVER this implementation 
   *       is MORE explicit!
   * @returns {string} the PkgTree node name (for human consumption).
   */
  getName() {
    return this.name;
  }

  /**
   * The children of self (for Dir nodes).
   * @returns {PkgTree[] | undefined} the children of self's Dir node (undefined for Entry node).
   */
  getChildren() {
    return this.entries;
  }
}
PkgTreeDir.unmangledName = 'PkgTreeDir';



/**
 * A PkgTree derivation modeling concrete entries (SmartPallet entries
 * that are in turn PkgEntries).
 */
export class PkgTreeEntry extends PkgTree {

  /**
   * Create a PkgTreeEntry.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {SmartPallet} entry - the SmartPallet promoted as self's entry.
   */
  constructor({entry, ...unknownArgs}={}) {
    // id/name coded defensively (for invalid entry param: will error out in check below)
    const id   = entry.getId   ? `Wrapping SmartPallet: ${entry.getId()}`   : 'INVALID: NOT wrapping a SmartPallet';
    const name = entry.getName ? `Wrapping SmartPallet: ${entry.getName()}` : 'INVALID: NOT wrapping a SmartPallet';
    super({id, name});

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()} constructor parameter violation: `);
    check(entry,                         'entry is required');
    check(entry instanceof SmartPallet,  'entry must be a SmartPallet');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.entry = entry;

    // maintain our parentage
    this.entry.setParent(this);
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    // because our id/name is derived from the supplied SmartPallet entry, we do not want our base class encoding
    // NO:
//  return [...super.getEncodingProps(), ...['entry']];
    // YES:
    return ['entry'];
  }

  /**
   * Self's PkgTree name, visualized in UI.
   * NOTE: Technically this API is promoted by SmartModel, and will work (since
   *       the correct name is promoted to SmartModel), HOWEVER this implementation 
   *       is MORE explicit!
   * @returns {string} the PkgTree node name (for human consumption).
   */
  getName() {
    return this.entry.getName();
  }

  /**
   * Self's entry (for Entry nodes).
   * @returns {SmartPallet | undefined} self's Entry node (undefined for Dir nodes).
   */
  getEntry() {
    return this.entry;
  }
}
PkgTreeEntry.unmangledName = 'PkgTreeEntry';
