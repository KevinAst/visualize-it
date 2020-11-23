import SmartModel        from './SmartModel';
import SmartClassRef     from './SmartClassRef';
import PseudoClass       from './PseudoClass';
import SmartPallet       from './SmartPallet';
import {ChangeManager}   from './changeManager';
import DispMode          from './DispMode';
import {isString,
        isArray,
        isPkg,
        isPkgTree}       from '../util/typeCheck';
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
   * Promote the material icon "name" representing self's OO classification.
   */
  getIconName() {
    return 'bubble_chart'; // alternate: bubble_chart, group_work, color_lense (for some reason wider), dashboard, widgets, blur_circular, ballot
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
   * Return an indicator as to whether self supports the supplied `dispMode`.
   *
   * @param {DispMode} dispMode - the display mode to evaluate.
   *
   * @returns {boolean} true: can handle, false: not supported.
   */
  canHandleDispMode(dispMode) {
    return dispMode !== DispMode.animate; // SmartPkg can be viewed and edited - NOT animated
  }

  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    // nothing to do, other than to enable this abstract method
    // ... unlike PkgEntry objects (that setup various event handlers)
    // ... SmartPkg objects merely utilize the getDispMode()
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {
    // nothing to do, other than to enable this abstract method
    // ... unlike PkgEntry objects (that setup various event handlers)
    // ... SmartPkg objects merely utilize the getDispMode()
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

  /**
   * Locate the PkgTree (Entry or Dir) from the specified pkgTreeId.
   * 
   * @param {string} pkgTreeId - the accumulative PkgTree ID of the
   * PkgTree to return ... ex:
   *   '{pkgId}|-::-|{dirName}|-::-|{dirName}|-::-|{entryName}'
   * 
   * @returns {PkgTree} the PkgTreeEntry/PkgTreeDir matching the
   * supplied `pkgTreeId`, `undefined` for not-found.
   */
  // ??$$ TRASH in subsequent/separate check-in (to be able to re-instate if needed)
  findPkgTreeOLD_OBSOLETE(pkgTreeId) {
    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.findPkgTree() for obj: {id:'${this.id}', name:'${this.name}'} parameter violation: `);
    // ... pkgTreeId
    check(pkgTreeId,           'pkgTreeId is required');
    check(isString(pkgTreeId), 'pkgTreeId must be a string');

    // split up the nodeIds from the accumulative pkgTreeId
    const [pkgId, ...nodeIds] = pkgTreeId.split(PkgTreeIdDelim);

    // NOTE: Algorithm tested manually with enclosed logs (currently commented out)
    //       console.log('\n'); console.log(`xx Test 1: `, this.getPkg().findPkgTree('XXX.astx.KONVA|-::-|scenes|-::-|More Depth|-::-|Scene2'));               
    //       console.log('\n'); console.log(`xx Test 2: `, this.getPkg().findPkgTree('com.astx.KONVA|-::-|scenes|-::-|XXXX Depth|-::-|Scene2'));               
    //       console.log('\n'); console.log(`xx Test 2: `, this.getPkg().findPkgTree('com.astx.KONVA|-::-|scenes|-::-|More Depth|-::-|XXXXX2'));               
    //       console.log('\n'); console.log(`xx Test 3: `, this.getPkg().findPkgTree('com.astx.KONVA|-::-|scenes|-::-|More Depth|-::-|Scene2|-::-|XXX'));      
    //       console.log('\n'); console.log(`xx Test 4: `, this.getPkg().findPkgTree('com.astx.KONVA|-::-|scenes|-::-|More Depth|-::-|Scene2'));               
    //       console.log('\n'); console.log(`xx Test 4: `, this.getPkg().findPkgTree('com.astx.KONVA|-::-|scenes|-::-|More Depth'));

    // insure starting node is OUR pkgId
    if (pkgId !== this.getPkgId()) {
      // console.log(`xx RETURN 1 TEST: SmartPkg.findPkgTree('${pkgTreeId}')`);
      return undefined;  // NOT FOUND: is NOT our pkg
    }

    // search through our rootDir
    // ... '{pkgId}|-::-|{dirName}|-::-|{dirName}|-::-|{entryName}'
    //        N/A            0              1              2        ... nodeIds INDEX
    let runningNode = this.rootDir; // our running PkgTree (PkgTreeEntry/PkgTreeDir) ... starting at rootDir
    for (let i=0; i<nodeIds.length; i++) {
      const runningId = nodeIds[i];
      if (runningNode.isDir()) { // ... for directories: search further in
        runningNode = runningNode.getChildren().find( (child) => child.getName() === runningId);
        if (!runningNode) {
          // console.log(`xx RETURN 2 TEST: SmartPkg.findPkgTree('${pkgTreeId}')`);
          return undefined;  // NOT FOUND: specified node NOT found
        }
      }
      else { // ... for entries: can't go any deeper
        // NOTE: The way our processing iteration works, we should NEVER hit this case
        //       - an entry should be found at the very end
        //       - in other words, entries should be found in the PREVIOUS iteration (above)
        //         returning control at THAT point
        //       - if we get this far, we know that additional nodes were specified in the pkgTreeId 
        //         beyond an entry, which CANT exist
        // console.log(`xx RETURN 3 TEST: SmartPkg.findPkgTree('${pkgTreeId}')`);
        return undefined;  // NOT FOUND: additional pkgTreeId nodes were specified
      }
    } // ... end of nodeIds iteration
    // console.log(`xx RETURN 4 TEST: SmartPkg.findPkgTree('${pkgTreeId}')`);
    return runningNode; // FOUND specified PkgTreeDir (PkgTreeEntry/PkgTreeDir)
  }

  /**
   * Locate the PkgTree (Entry or Dir) from the specified pkgTreeKey.
   * 
   * @param {string} pkgTreeKey - the PkgTree key to find.
   * 
   * @returns {PkgTree} the PkgTreeEntry/PkgTreeDir matching the
   * supplied `pkgTreeKey`, `undefined` for not-found.
   */
  findPkgTree(pkgTreeKey) {
    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.findPkgTree() for obj: {id:'${this.id}', name:'${this.name}'} parameter violation: `);
    // ... pkgTreeKey
    check(pkgTreeKey,           'pkgTreeKey is required');
    check(isString(pkgTreeKey), 'pkgTreeKey must be a string');

    // forward on to our root directory
    return this.rootDir.findPkgTree(pkgTreeKey);
  }

  /**
   * Provide symbolic representation of self.
   *
   * @param {string} [treeDirective] a proprietary directive that when
   * set to 'tree', will emit the PkgTree structure.
   * 
   * @returns {string} a human consumable representation of self
   */
  toString(treeDirective) {
    let selfStr = `SmartPkg: ${this.getPkgId()} (${this.getPkgName()})`;
    if (treeDirective === 'tree') {
      selfStr += '\n' + this.rootDir.toString(1);
    }
    return selfStr;
  }

}
SmartPkg.unmangledName = 'SmartPkg';



/**
 * A tree-based structure cataloging entries and directories (with
 * depth) of a SmartPkg.
 */
class PkgTree extends SmartModel {

  /**
   * Create a PkgTree.
   */
  constructor({id, name}) {
    super({id, name});

    // maintain our unique and unchanging key
    this.key = `PkgTreeKey-${nextPkgTreeKey++}`;
  }

  /**
   * Self's unique and unchanging key (analogous to a memory address).
   * @returns {string} self's unique and unchanging key (analogous to a memory address).
   */
  getKey() {
    return this.key;
  }


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

  /**
   * Indicator as to whether self is the tree root of all PkgTree entry nodes.
   * @returns {boolean} true: root node, false: non-root node
   */
  isRoot() {
    return isPkg(this.getParent()); // ... if our parent is the SmartPkg, we are the root!
  }

  /**
   * Self's accumulative pkgTreeId.
   * 
   * This is an accumulative id, starting with the pkgId, followed by
   * all accumulative node names ... ex:
   *   '{pkgId}|-::-|{dirName}|-::-|{dirName}|-::-|{entryName}'
   * 
   * @returns {string} self's accumulative pkgTreeId.
   */
  // ??$$ TRASH in subsequent/separate check-in (to be able to re-instate if needed)
  getPkgTreeId() {
    //                     TOP: use our pkgId         INTERMEDIATE: prefix parent node ids
    return this.isRoot() ? this.getPkg().getPkgId() : this.getParent().getPkgTreeId() + PkgTreeIdDelim + this.getName();;
  }

  /**
   * Convenience utility returning DnD type restricting PkgTree DnD to same package.
   *
   * API: DnD
   *
   * @returns {string} a CopySrc: {type, key} ... null when NOT copyable
   */
  dndPastableTypeType() {
    return `visualize-it/PkgTree#${this.getPkg().getPkgId()}`.toLowerCase();
  }

  /**
   * Provide indicator as to whether self can be copied to other sources (i.e. a DnD source)
   *
   * API: DnD
   *
   * @returns {CopySrc} a CopySrc: {type, key} ... null when NOT copyable
   */
  copyable() {
    return {
      type: this.dndPastableTypeType(), // self represents PkgTree instance of a specific Pkg (both PkgTreeDir/PkgTreeEntry handled consistently)
      key:  this.getKey(),
    };
  }

  /**
   * Is the content of the supplied DnD event pastable in self (i.e. a DnD target)
   *
   * API: DnD
   *
   * @param {Event} e - the DnD event
   *
   * @returns {boolean} `true`: content of DnD event IS pastable, `false` otherwise
   */
  pastable(e) {
    // console.log(`xx PkgTree.pastable(e): `, {lookingFor: this.dndPastableTypeType(), inTypes: e.dataTransfer.types});
    return e.dataTransfer.types.includes(this.dndPastableTypeType());
  }

  /**
   * Perform the DnD paste operation of the supplied DnD event.
   *
   * API: DnD
   *
   * @param {Event} e - the DnD event
   */
  paste(e) {
    // verify we are in edit mode
    // ... NOT NEEDED: Package Edit takes a different tact
    //                 disabling DnD when NOT in edit mode

    // reconstitute our copySrc from the DnD event
    // NOTE: we know the supplied copySrc references a PkgTree object (see pastable() method above)
    const type    = this.dndPastableTypeType();
    const copySrc = {
      type,
      key: e.dataTransfer.getData(type), // ... will exist based on `pastable(e)` (above)
    };
    // console.log(`XX PkgTree.paste(e): `, {copySrc});

    // define our DnD from/to (both PkgTree objects)
    const fromPkgTree = this.getPkg().findPkgTree(copySrc.key);
    const toPkgTree   = this;
    // console.log(`XX pasting more info: `, {copySrc, fromPkgTree, toPkgTree});

    // NO-OP when duplicate paste events are detected
    // BUG: There is an obscure condition where DUPLICATE paste events are registered
    //      in some cases, AFTER a PkgTree directory structure changes.
    //      - it is UNCLEAR if this is an app logic bug, or a svelte bug
    //      - TO RECREATE (this is one, there are many):
    //        1. DRAG "More Depth" ON "Scene1" (placing "More Depth" dir BEFORE Scene1 entry)
    //        2. DRAG "Scene1" ON "Scene2"     (placing "Scene1" entry   BEFORE Scene2 entry -AND- moving it to a diff dir)
    //           - see duplicate event (here)
    //           - NOTE: Does NOT occur if you collapse/expand "scenes" OR "More Depth" node between steps 1/2
    //                   This is due to the fact that we delete and re-create all DOM/events from scratch
    //      - SUSPECT:
    //        1. potential BUG in svelte
    //           * it is unclear what is causing the dup events (it could be svelte)
    //        2. some app-specific reflexivity issue in ViewPkgTree.svelte
    //           * I have tried several things, but cannot find it
    //           * for example:
    //             - some #each/key issue
    //      - WORK-AROUND:
    //        * THIS NO-OP logic has circumvented the issue (for now)
    //        * When there were DUP EVENTS (before this detection), you could clear the dups by:
    //          - simply collapse/expand entire package (this destroys the DOM and starts over)
    if (lastPkgTreePasteEvent === e) {
      console.warn('*** WARNING *** PkgTree.paste(e): NO-OP: Detected duplicate paste event, ' + 
                   'WORK-AROUND IN PLACE (should be OK) ... see: BUG in SmartPkg.js):', {copySrc, fromPkgTree, toPkgTree});
      // NO-OP
      // ... NOTE: Since the retrofit using the non-changing pkgTreeKey (vs. accumulative and changing tree id)
      //           it appears this no-op is no longer needed (i.e. the return)
      //           HOWEVER, I'm leaving it in for now.
      return;
    }
    else {
      lastPkgTreePasteEvent = e;
    }

    // helpers to service undo/redo
    // IMPORTANT: all updates must be written in such a way that DOES NOT reference stale objects
    //            - when using undo/redo (over the course of time) objects may be "swapped out" via the synchronization process
    //            - SOLUTION: resolve all objects from the "id" string AT RUN-TIME!!
    const pkg           = this.getPkg(); // ... believe we can put a stake in the ground the SmartPkg instance will NOT change
                                         //     (if not, retain the pkgId and reconstitute with pkgManager)
    const fromPkgTreeKey = fromPkgTree.getKey();
    const toPkgTreeKey   = toPkgTree.getKey();

    // original positions are needed for undo operation
    const original_fromParentPkgTreeKey = fromPkgTree.getParent().getKey();
    const original_fromParentIndex      = fromPkgTree.getParent().getChildren().indexOf(fromPkgTree);
 // const original_toParentIndex        = toPkgTree.getParent().getChildren().indexOf(toPkgTree); ... NOT NEEDED

    // apply our change
    this.getPkg().changeManager.applyChange({
      changeFn() {
        const fromNode = pkg.findPkgTree(fromPkgTreeKey);
        const toNode   = pkg.findPkgTree(toPkgTreeKey);

        // CRC sync must account for PRIOR parent of fromNode
        // ... in the event we are moving it OUT of this directory
        const fromNodePriorParent = fromNode.getParent();

        // this is it - reposition the pkg dir structure!
        // console.log(`XX in PkgTree.paste() INVOKING move(): `, {from: fromNode, to: toNode});
        toNode.move(fromNode);
    
        // communicate both fromNode/toNode/etc
        // ... allowing both CRC computations to be synced (via SmartObj.trickleUpChange())
        return [fromNode, toNode, fromNodePriorParent];
      },
    
      undoFn() {
        const fromNode = pkg.findPkgTree(fromPkgTreeKey);
        const toNode   = pkg.findPkgTree(toPkgTreeKey);

        // CRC sync must account for PRIOR parent of fromNode
        // ... in the event we are moving it OUT of this directory
        const fromNodePriorParent = fromNode.getParent();

        // this is it - reset the pkg dir structure to it's original position!
        // ... ORIGINAL OP WAS: remove from / insert to
        //     UNDO     OP IS:  remove to   / insert from

        // ... remove to - MUST be done first to accommodate cleanup when from/to share same parent
        const toParent   = toNode.getParent();
        const toNodeIndx = toParent().getChildren().indexOf(toNode);
        toParent.getChildren().splice(toNodeIndx, 1);

        // ... insert from
        // ?? NOT SURE THIS IS RIGHT ... do we need some directory logic sim to original operation?
        //? const fromParent   = fromNode.getParent();
        //? fromParent.getChildren().splice(original_fromParentIndex, 0, fromNode);
        // ?? try this
        const fromParentNode = pkg.findPkgTree(original_fromParentPkgTreeKey);
        fromParentNode.getChildren().splice(original_fromParentIndex, 0, fromNode);

        // communicate both fromNode/toNode/etc
        // ... allowing both CRC computations to be synced (via SmartObj.trickleUpChange())
        return [fromNode, toNode, fromNodePriorParent];
      }
    });
  }

  /**
   * Move the supplied `fromPkgTree` node before self.  Both nodes must be in
   * the same package, ?? and a directory cannot be moved into it's descendant path
   *
   * ?? initial heuristic (before toNode when Entry, first-child when Dir)
   *
   * @param {PkgTree} fromPkgTree - the node to move.
   */
  move(fromPkgTree) {
    // console.log(`XX in PkgTree.move(): `, {from: fromPkgTree, to: this});

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}.move() parameter violation: `);
    // ... fromPkgTree
    check(fromPkgTree,            'fromPkgTree is required');
    check(isPkgTree(fromPkgTree), 'fromPkgTree must be a PkgTree');
    check(this.getPkg() === fromPkgTree.getPkg(), 'fromPkgTree must be in same SmartPkg as self');

    // setup needed state
    const fromNode   = fromPkgTree;
    const fromParent = fromNode.getParent();
    const toNode     = this;
    const toParent   = toNode.getParent();

    // no-op when fromNode/toNode are the same
    if (fromNode === toNode) {
      return;
    }

    // prevent the following invalid condition: a from directory cannot be moved into it's descendant path
    // ... ?? AI: if we restrict this in DnD, we can make this a true check/error
    if (fromNode.isDir() && toNode.isDescendantOf(fromNode)) {
      alert(`?? TOAST: from directory cannot be moved into it's descendant tree`);
      return;
    }

    // Part I (cleanup `from` original): remove fromNode from it's original source
    // ... MUST be done first to accommodate cleanup when from/to share same parent
    const fromNodeIndx = fromParent.getChildren().indexOf(fromNode);
    fromParent.getChildren().splice(fromNodeIndx, 1);

    // Part II (adjust `to`)
    // ... when toNode is a directory: place fromNode as first child of toNode directory
    if (toNode.isDir()) {
      toNode.getChildren().splice(0, 0, fromNode);
    }
    // ... when toNode is an entry: place fromNode before toNode
    else {
      const toNodeIndx = toParent.getChildren().indexOf(toNode);
      toParent.getChildren().splice(toNodeIndx, 0, fromNode);
    }

  }

  /**
   * Resync the PkgTree parentage after Pkg directory structure
   * changes (used by changeManager).
   *
   * @param {SmartPkg|PkgTree} parent the parent of self.
   */
  syncParent(parent) {
    this.parent = parent;
    // recurse into any sub-directories
    if (this.isDir()) {
      this.getChildren().forEach( (child) => child.syncParent(this) );
    }
  }

  /**
   * Return indicator as to whether self is a descendant of the
   * supplied ancestorPkgTree.
   *
   * @param {PkgTree} ancestorPkgTree the ancestor to check.
   * 
   * @returns {boolean} true: self is a decedent of ancestorPkgTree,
   * false: otherwise.
   */
  isDescendantOf(ancestorPkgTree) {
    // if self is the supplied ancestorPkgTree, we ARE a descendant
    if (this === ancestorPkgTree) return true;

    // if we hit the top, we are NOT a descendant
    if (this.isRoot()) return false;

    // keep looking up recursively
    return this.getParent().isDescendantOf(ancestorPkgTree);
  }

  /**
   * Locate the PkgTree (Entry or Dir) from the specified pkgTreeKey.
   * 
   * @param {string} pkgTreeKey - the PkgTree key to find.
   * 
   * @returns {PkgTree} the PkgTreeEntry/PkgTreeDir matching the
   * supplied `pkgTreeKey`, `undefined` for not-found.
   */
  findPkgTree(pkgTreeKey) {
    // NOTE: for NOT-FOUND conditions, this algorithm uses implicit returns (yielding undefined)
    if (this.getKey() === pkgTreeKey) { // found it
      return this;
    }
    else if (this.isDir()) { // recursively keep searching directory entries
      const children = this.getChildren();
      for (let i=0; i<children.length; i++) {
        const child   = children[i];
        const pkgTree = child.findPkgTree(pkgTreeKey);
        if (pkgTree) {
          return pkgTree;  // found it
        }
      }
    }
  }

  /**
   * Provide symbolic representation of self - a visual indented tree
   * (useful in diagnostics).
   *
   * @param {int} [indentLvl=0] an internal indicator as to the tree
   * indentation level in effect.
   * 
   * @returns {string} a human consumable visual indented tree of self.
   */
  toString(indentLvl=0) {
    const indentStr = ''.padStart(indentLvl*2, ' '); // 2 spaces per indention level
    let   selfStr   = indentStr + this.getName() + (this.isDir() ? '/' : '') + ` (${this.getKey()})\n`; // basic name (with '/' on dirs)
    if (this.isDir()) { // recurse on directory children
      selfStr = this.getChildren().reduce( (accumStr, child) => accumStr + child.toString(indentLvl+1), selfStr );
    }
    return selfStr;
  }

}
PkgTree.unmangledName = 'PkgTree';

// the next PkgTree unique and unchanging key
let nextPkgTreeKey = 1;

// last PkgTree paste event (used in detecting duplicate paste events
let lastPkgTreePasteEvent = null;


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

// delimiter used in pkgTreeId
// ??$$ TRASH in subsequent/separate check-in (to be able to re-instate if needed)
const PkgTreeIdDelim = '|-::-|';
