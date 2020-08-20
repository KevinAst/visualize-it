import verify            from '../util/verify';
import {isString,
        isPlainObject,
        isArray,
        isPkgEntry,
        isClass}         from '../util/typeCheck';
import checkUnknownArgs  from '../util/checkUnknownArgs';
import SmartModel        from '../core/SmartModel';
import CompRef           from '../core/CompRef';
import SmartClassRef     from '../core/SmartClassRef';


//********************************************************************************
// ?? OBSOLETE MODULE: see SmartPkg.js for PRODUCTION RENDITION)
// ?? SmartPkg.entries done right (AI: currently a proof-of-concept


/**
 * A tree-based structure cataloging entries and directories (with
 * depth) of a SmartPkg.
 */
export class PkgTree extends SmartModel {

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
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['name', 'entries']];
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
  constructor({entry, pkg, ...unknownArgs}={}) { // >>> ?? FIX: pkg param TEMPORARILY needed for class entry wrapper of CompRef ... ULTIMATELY will directly come in as a CompRef
    super({id: 'L8TR', name: 'L8TR'}); // ... too early to know (post-process this - see below)

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()} constructor parameter violation: `);
    // ... entry ?? ULTIMATELY (once in mainstream usage) I think this needs to be a SmartPallet, which will in turn become a pkgEntry WITHIN the post-processing of SmartPkg
    //           ?? this is reflected in JavaDoc (above)
    //           ?? however needs to be accomplished HERE and throughout SmartPkg post-processing
    check(entry,                               'entry is required');
    check(isPkgEntry(entry) || isClass(entry), 'entry must be a PkgEntry -or- a class'); // ?? really SmartPallet
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    // ANALYSIS: we must retrofit raw classes into a SmartModel/SmartPallet/CompRef
    //           ULTIMATELY this will be done by DIRECTLY using Entry/CompRef in SmartPkg
    if (isPkgEntry(entry)) {
      this.entry = entry;
    }
    else { // ... isClass(entry) ... convert into CompRef (a pkgEntry)
      const clazz     = entry;
      const clazzName = clazz.unmangledName || clazz.name;
      const compRef   = new CompRef({id:   clazzName, // id (only think we have is name) ??$$ I think a CompRef can get by with the compClassRef <SmartClassRef> ... from there it will derive id/name via: compClassRef.getClassName()
                                     name: clazzName,
                                     compClassRef: new SmartClassRef(clazz, pkg.getPkgId())});

      // stuff that would normally be done in SmartPkg (once fully retrofitted)
      compRef.markAsPkgEntry(); // AI: suspect this will work here BECAUSE pkgManager is still based on raw entry ... ULTIMATELY (once retrofitted) pkgManager needs to know and catalog this
      compRef.setParent(pkg);   // ANALYSIS: need parentage, so getPkgEntryId() will work
      // ANALYSIS: normally done via SmartModel.setParent(parent) in:
      // - constructor: Collage(...scenes) ... hooking up Collage         -1:m- scenes
      // - constructor: CompRef(...)       ... hooking up Scene (working) -1:1- CompRef (this) 
      // - constructor: Scene(...comps)    ... hooking up Scene           -1:m- comp
      // - SmartPkg.initializeCatalogs(entry) ... hooking up SmartPkg     -1:m- pkgEntries <<< THIS IS KEY (currently does NOT hook up because we only have a class TILL the retrofit)

      this.entry = compRef;
    }

    // post-process real SmartModel id/name (once we know this)
    // TODO: ?? ULTIMATELY this should NOT be needed when we pass in a SmartPallet
    //       ... just pass in the entries id/name or some derivative, ex: `PkgTreeEntry for PkgEntry: ${entry.getId()}`
    this.id   = this.entry.getName();
    this.name = this.entry.getName();
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['entry']];
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


//********************************************************************************
// convert pkg.entries TO: PkgTree
// ... our temporary stop-gap measure
// RETURN: Dir PkgTree derivation
// ?? OBSOLETE once fully integrated ... part of SmartModel
export function pkgEntry2Tree(pkg) {

  const check = verify.prefix(`***ERROR*** pkgEntry2Tree(): `);

  // seed pkg.entries with the root "/" directory
  // ... varies based on starting point 
  //                                        plainObject dir wrapper     array of entries/dirs
  //                                        =========================   =====================
  const seed = isPlainObject(pkg.entries) ? {"/": [{...pkg.entries}]} : {"/": pkg.entries};

  // do the conversion
  // ... because we seed with a single root, 
  //     this will ALWAYS be a single Dir (never an array)
  return accumLegacyEntries(seed);

  // recursive accumulation of legacy entries
  // RETURN: Dir -or- PkgTree[] which gets unwound internally into a Dir
  function accumLegacyEntries(legacyEntry) {

    // process Directory Wrapper (PlainObject),
    // - a container of named directories of the form:
    //   {dirName: [Dir, Entry, Dir, Entry, ...]}
    // - NOTE: We restrict the Directory Wrapper to ONE directory at a time
    //         ... technically the structure could handle multiple directory entries directly
    //         ... HOWEVER there is no place to unwind these multiple dir entries :-(
    //         WORKAROUND: MULTIPLE Directory Wrappers can be placed in an array container
    if (isPlainObject(legacyEntry)) {
      const dirWrapper = legacyEntry; // ... alias to clarify logic
      // accumulate all named directory nodes
      const dirEntries = []; // Dir[]
      for (const dirName in dirWrapper) {
        const dirContentArr = dirWrapper[dirName];
        check(isArray(dirContentArr), `a Directory Wrapper (PlainObject) contains a dirName: "${dirName}" whose content is NOT an array.`);
        dirEntries.push( new PkgTreeDir({name: dirName, entries: accumLegacyEntries(dirContentArr)}) );
      }
      // restrict usage to first entry only (see NOTE above)
      check(dirEntries.length === 1, 'Directory Wrapper (PlainObject) only supports one directory at a time, ' + 
                                     `found: ${dirEntries.map((dir)=>dir.getName())} ` +
                                     '... you can place multiple Directory Wrappers in an array container');
      return dirEntries[0];
    }

    // process Directory Content (Array),
    // - containing multiple entries/dirs of the form:
    //     Entry     Dir                    Entry     Dir                    etc
    //     ========  =====================  ========  =====================  ===
    //   [ PkgEntry, { "dirName1": [...] }, PkgEntry, { "dirName2": [...] }, ... ]
    else if (isArray(legacyEntry)) {
      const dirContent = legacyEntry; // ... alias to clarify logic

      // morph supplied array into PkgTree[] ... ex: [ Entry, Dir, Entry, Entry, Dir, ... ]
      const dirAccum = dirContent.map( (arrItem) => {

        // support real entries <<< morph into the Entry PkgTree derivation
        // ... either a PkgEntry
        // ... or a class (eventually WILL be a PkgEntry with the advent of CompRef SmartPallet derivation)
        if (isPkgEntry(arrItem) || isClass(arrItem)) { // ?? here is our special isClass check again
          const realEntry = arrItem; // ... alias to clarify logic
          return new PkgTreeEntry({entry: realEntry, pkg}); // ?? ULTIMATELY pkg param NOT needed
        }

        // support directory wrappers (a plainObject) <<< morph into the Dir PkgTree derivation
        else if (isPlainObject(arrItem)) {
          const dirWrapper = arrItem; // ... alias to clarify logic
          return accumLegacyEntries(dirWrapper);
        }

        // other types are NOT supported (should not happen - defensive only)
        else {
          const errMsg = 'an unsupported directory content array entry was found ' + 
                         '... must be a real entry (PkgEntry or class) or a PlainObject directory wrapper ' +
                         '... see logs for entry';
          console.error(errMsg, {arrItem});
          check(false, errMsg);
        }
      });

      // we return an array accumulation: PkgTree[]
      // ... which will be internally unwound as follows: `new Dir({name: dirName, entries: THIS-RETURN})`
      return dirAccum;
    }

    // other entries are NOT supported (should not happen - defensive only)
    else {
      const errMsg = 'an unsupported SmartPkg entry was found ' +
                     '... must be a Directory Wrapper (PlainObject) or a Directory Content (Array) ' +
                     '... see logs for entry';
      console.error(errMsg, {legacyEntry});
      check(false, errMsg);
    }

  } // end of ... accumLegacyEntries()

} // end of ... pkgEntry2Tree()
