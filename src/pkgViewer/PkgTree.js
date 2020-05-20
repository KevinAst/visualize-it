import verify            from '../util/verify';
import {isString,
        isPlainObject,
        isArray,
        isPkgEntry,
        isClass}         from '../util/typeCheck';
import checkUnknownArgs  from '../util/checkUnknownArgs';


//********************************************************************************
// SmartPkg.entries done right (AI: currently a proof-of-concept)
export class PkgTree {

  getName() { // getName(): string ... AI: may conflict with SmartModel
    throw new Error(`***ERROR*** PkgTree pseudo-interface-violation: ${this.diagClassName()}.getName() is an abstract method that MUST BE implemented!`);
  }

  getChildren() { // getChildren(): PkgTree[] | undefined
    return undefined; // by default, NO children are supported
  }

  isDir() { // isDir(): boolean
    return this.getChildren() ? true : false;
  }

  isEntry() { // isEntry(): boolean
    return !this.isDir();
  }

  diagClassName() { // AI: really part of SmartModel
    return this.constructor.unmangledName || this.constructor.name;
  }
}
PkgTree.unmangledName = 'PkgTree';


//********************************************************************************
export class Dir extends PkgTree {

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
export class Entry extends PkgTree {

  constructor({entry, ...unknownArgs}={}) {
    super();
    // validate parameters
    const check = verify.prefix(`${this.diagClassName()} constructor parameter violation: `);
    // ... entry
    check(entry,                               'entry is required');
    check(isPkgEntry(entry) || isClass(entry), 'entry must be a PkgEntry -or- a class');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.entry = entry;
  }

  getName() { // getName(): string
    // AI: this will eventually be cleaned up through CompRef/SmartClassRef usage
    if (isPkgEntry(this.entry)) {
      return this.entry.getName();
    }
    else { // ... a real class
      return this.entry.unmangledName || this.entry.name;
    }
  }
}
Entry.unmangledName = 'Entry';


//********************************************************************************
// convert pkg.entries TO: PkgTree
// ... our temporary stop-gap measure
// RETURN: Dir PkgTree derivation
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
        if (isPkgEntry(arrItem) || isClass(arrItem)) {
          const realEntry = arrItem; // ... alias to clarify logic
          return new Entry({entry: realEntry});
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
