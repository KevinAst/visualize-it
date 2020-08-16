import verify            from '../util/verify';
import {isString,
        isPlainObject,
        isArray,
        isPkgEntry,
        isClass}         from '../util/typeCheck';
import checkUnknownArgs  from '../util/checkUnknownArgs';
import CompRef           from '../core/CompRef';
import SmartClassRef     from '../core/SmartClassRef';


// ?? consider pkgEntry term in lue of entry
// ... however this is really a distinction of directory/entry
// ... STILL: this is a PkgTree ... as in pkgEntries
// ... ?? SOOO: rename ALL nodes to begin with Pkg:
//     PkgDir/PkgEntry ?? HOWEVER: this may conflict with a real PkgEntry should we decide to do this in the future?
//     PkgTreeDir/PkgTreeEntry ?? what about this ... this makes it clear that we are dealing with the PkgTree wrapper

//********************************************************************************
// SmartPkg.entries done right (AI: currently a proof-of-concept)
export class PkgTree {

  getName() { // getName(): string ... AI: may conflict with SmartModel
    throw new Error(`***ERROR*** PkgTree pseudo-interface-violation: ${this.diagClassName()}.getName() is an abstract method that MUST BE implemented!`);
  }

  // ?? only used in one spot: src/pkgViewer/ViewPkgTree.svelte
  // ?? technically only applicable for Dir, however usage is for all nodes
  getChildren() { // getChildren(): PkgTree[] | undefined
    return undefined; // by default, NO children are supported
  }

  // ?? hmmm NOT USED ANYWHERE ... just a coorelatation to isEntry()
  isDir() { // isDir(): boolean
    return this.getChildren() ? true : false;
  }

  // ?? only used in one spot: src/pkgViewer/ViewPkgTree.svelte
  isEntry() { // isEntry(): boolean
    return !this.isDir();
  }

  diagClassName() { // AI: really part of SmartModel
    return this.constructor.unmangledName || this.constructor.name;
  }
}
PkgTree.unmangledName = 'PkgTree';


//********************************************************************************
export class Dir extends PkgTree { // ... a directory of PkgTree entries (PkgTree[])

  constructor({name, entries=[], ...unknownArgs}={}) {
    super();
    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}(name:'${name}') constructor parameter violation: `);
    // ... name
    check(name,             'name is required');
    check(isString(name),   'name must be a string');
    // ... entries
    check(isArray(entries), 'entries must be an array (when supplied)');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.name    = name;
    this.entries = entries;
  }

  getName() { // getName(): string
    return this.name;
  }

  getChildren() { // getChildren(): PkgTree[] | undefined
    return this.entries;
  }
}
Dir.unmangledName = 'Dir';


//********************************************************************************
export class Entry extends PkgTree { // ... a PkgTree PkgEntry <isPkgEntry() || CompRef> (which is also a pkgEntry) ... I think this is where the whole SmartPallet/pkgEntry merge is all about

  constructor({entry, pkg, ...unknownArgs}={}) { // >>> ?? FIX: pkg needed for class entry wrapper of CompRef
    super();
    // validate parameters
    const check = verify.prefix(`${this.diagClassName()} constructor parameter violation: `);
    // ... entry
    check(entry,                               'entry is required');
    check(isPkgEntry(entry) || isClass(entry), 'entry must be a PkgEntry -or- a class');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    // ANALYSIS: we must retrofit raw classes into a SmartModel/SmartPallet/CompRef
    //           ULTIMATELY this will be done by DIRECTLY using Entry/CompRef in SmartPkg
    // ?? FIX:
    // >>> OLD:
    //? this.entry = entry;
    // >>> NEW:
    if (isPkgEntry(entry)) {
      this.entry = entry;
    }
    else { // ... isClass(entry) ... convert into CompRef (a pkgEntry)
      const clazz     = entry;
      const clazzName = clazz.unmangledName || clazz.name;
      const compRef   = new CompRef({id:   clazzName, // id (only think we have is name)
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
  }

  getName() { // getName(): string
    // ??  FIX:
    // >>> OLD:
    // AI: this will eventually be cleaned up through CompRef/SmartClassRef usage
    //? if (isPkgEntry(this.entry)) {
    //?   return this.entry.getName();
    //? }
    //? else { // ... a real class
    //?   return this.entry.unmangledName || this.entry.name;
    //? }
    // >>> NEW:
    return this.entry.getName();
  }
}
Entry.unmangledName = 'Entry';


//********************************************************************************
// convert pkg.entries TO: PkgTree
// ... our temporary stop-gap measure
// RETURN: Dir PkgTree derivation
export function pkgEntry2Tree(pkg) {

  const check = verify.prefix(`***ERROR*** pkgEntry2Tree(): `);

//  const myPkgId = pkg.getPkgId(); ?? NO just use pkg

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
        dirEntries.push( new Dir({name: dirName, entries: accumLegacyEntries(dirContentArr)}) );
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
          return new Entry({entry: realEntry, pkg}); // ?? use pkg instead of myPkgId
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
