import SmartPkg    from './SmartPkg';
import verify      from 'util/verify';
import {isString}  from 'util/typeCheck';

/**
 * PkgManager is the manager of ALL packages (SmartPkg)
 * loaded/maintained in the visualize-it application.
 * 
 * This provides a clearing house to resolve classRefs, used to
 * resolve low-level resource-based hydration ... see:
 * `SmartModel.fromSmartJSON()`
 */
class PkgManager {

  /**
   * Create a PkgManager.
   */
  constructor() {
    // carve out our pkgCatalog
    this.pkgCatalog = {
      // [pkgName]: smartPkg, // AI: I think we want pkgResourcePath to be part of SmartPkg
      // ...
    };
    this.pkgCatalogArrTemp = []; // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
  }

  /**
   * Load a package (SmartPkg) from an external resource (ex: web or
   * local file) and catalog it in self.
   *
   * The newly loaded package will automatically be registered in self
   * (via registerPkg()).
   *
   * @param {YetUnknown} [pkgResourcePath] - the optional resource
   * path of the package to retrieve.  When not supplied, an
   * interactive resource picker dialog will be presented.
   *
   * @returns {SmartPkg via Promise} the newly loaded package
   * (undefined when operation canceled).
   * 
   * @throws {Error} an Error is thrown in various scenarios
   * (pkgResourcePath not found, uninterpretable resource content,
   * invalid params, etc.).
   */
  async loadPkg(pkgResourcePath) {

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}.loadPkg() parameter violation: `);

    // ... pkgResourcePath (when supplied)
    if (pkgResourcePath) {
      check(pkgResourcePath,       'currently only handles "interactive resource picker dialog" ... do NOT know how to handle a pkgResourcePath param :-('); // AI: temp for now
      check(pkgResourcePath===123, 'pkgResourcePath (when supplied) must be a YetUnknown'); // AI: future TEMPLATE
    }
    else {
      // insure we have access to the "Native File System API TRIAL"
      if (!window.chooseFileSystemEntries) {
        throw new Error(`***ERROR*** ${this.constructor.name}.loadPkg() the "Native File System API TRIAL" is NOT available in this environment :-(`)
          .defineAttemptingToMsg('display an interactive resource picker dialog');
      }
    }

    // define our fileHandle
    // ... AI: determine how to retain a neutral version of this resource, for "save" operations (possibly in loaded SmartPkg)
    let fileHandle = null;

    // ... when pkgResourcePath IS supplied, AI: figure this out
    if (pkgResourcePath) {
      // NOTE: currently errors out (in parameter validation above)
    }
    // ... when pkgResourcePath NOT supplied, define our fileHandle via an interactive resource picker dialog
    else {
      fileHandle = await window.chooseFileSystemEntries();
      // ?? handle user cancel operation
    }

    // load the file blob
    // ... NOTE: file is w3c - https://w3c.github.io/FileAPI/#dfn-file
    const file = await fileHandle.getFile();

    // resolve the file content
    // ... see: https://w3c.github.io/FileAPI/#text-method-algo
    const fileContent = await file.text();

    /* AI: need pkgResourcePath out of fileHandle
           PROBLEM: can only get fileName ('textData.txt') NOT it's containing path/directory
           ... needs MORE research
           - fileHandle: {
              isDirectory: false
              isFile:      true
              name:        'testData.txt'
             }
           - file: {
              name:        'testData.txt'
              lastModified: 222333444
              webkitRelativePath: ''
              size:  123
              type: 'text/plain'
           - there is a fileHandle = directoryHandle.getFile(name)
             * there are TWO handle refs ... can be:
               - FileSystemFileHandle ........ handle.isFile
               - FileSystemDirectoryHandle ... handle.isDirectory
    */

    // resolve content to json
    let smartJSON = null
    try {
      smartJSON = JSON.parse(fileContent);
    }
    catch(err) { // SyntaxError
      throw err.defineAttemptingToMsg(`interpret resource as smartJSON in ${this.constructor.name}.loadPkg()`);

    }

    // resolve to a SmartPkg
    const smartPkg = SmartPkg.fromSmartJSON(smartJSON);

    // register this package in self
    this.registerPkg(smartPkg); // AI: is pkgResourcePath a param -OR- embedded in SmartPkg

    // that's all folks
    return smartPkg;
  }

  /**
   * Register the supplied package in self.
   *
   * This registration:
   *
   * - makes SmartPkg resources available to low-level processes (for
   *   example, classRefs used in resolving resource-based hydration)
   *   ... see: getClassRef() / getEntry()
   * 
   * - is independent of LeftNav visualization (this is accomplished
   *   through `leftNavManager.addLeftNav(smartPkg)`)
   *
   * This registration  occurs automatically when using `loadPkg()`
   * ... so it could be interpreted as a pseudo private method.
   * 
   * - However, non-resource-based packages must register themselves
   *   using this entry point ... for ex:
   *    - code-only packages (as in core offerings)
   *    - unit tests
   *    - etc.
   *   This registration can be accomplished VERY EARLY (e.g. during
   *   code expansion of core classes).
   *
   * @param {SmartPkg} smartPkg - the package to register.
   */
  registerPkg(smartPkg) { // AI: handle 2nd pkgResourcePath param ... I think we want pkgResourcePath to be part of SmartPkg

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}.registerPkg() parameter violation: `);

    // ... smartPkg
    check(smartPkg,                     'smartPkg is required');
    check(smartPkg instanceof SmartPkg, 'smartPkg must be a SmartPkg instance');

    // maintain our package catalog
    this.pkgCatalog[smartPkg.getPkgName()] = smartPkg;
    // console.log(`?? PkgManager.registerPkg() registering smartPkg: `, smartPkg);
    this.pkgCatalogArrTemp.push(smartPkg); // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
  }


  /**
   * Resolve classRefs managed in self's packages.
   *
   * NOTE: This accessor is commonly used in the rehydration process
   *       (SmartModel.fromSmartJSON()) to resolve classes at a low level.
   *
   * @param {string} className - the class name of the classRef to return.
   * @param {string} pkgName - the package name that the class belongs to.
   *
   * @returns {classRef} the resolved classRef (either a
   * real class or a pseudoClass), undefined for not-found.
   */
  getClassRef(className, pkgName) {

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}.getEntry() parameter violation: `);
    // ... className
    check(className,           'className is required');
    check(isString(className), 'className must be a string');
    // ... pkgName
    check(pkgName,             'pkgName is required');
    check(isString(pkgName),   'pkgName must be a string');

    // L8TR_pkgName: PRODUCTION IMPLEMENTATION, WITH pkgName
    //? // resolve the package containing the class
    //? const smartPkg = this.pkgCatalog[pkgName];
    //? if (!smartPkg) {
    //?   return; // AI: consider throwing error if this package is NOT cataloged?
    //? }
    //? 
    //? // resolve the classRef, if any (when defined in package)
    //? return smartPkg.getClassRef(className, pkgName); // AI: may NOT need pkgName here

    // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
    for (const smartPkg of this.pkgCatalogArrTemp) {
      //console.log(`?? searching for className: ${className} in smartPkg: `, smartPkg);
      const classRef = smartPkg.getClassRef(className, pkgName);
      if (classRef) {
        //console.log(`?? FOUND IT`);
        return classRef;
      }
    }
  }

  /**
   * Resolve entries managed in self's packages.
   *
   * NOTE: This accessor is commonly used by the tabManager to resolve
   *       entries at a low level.
   *
   * @param {string} entryId - the entry ID of the entry to return.
   * @param {string} pkgName - the package name that the entry belongs to.
   *
   * @returns {entry} the entry matching the supplied params,
   * undefined for not-found.
   */
  getEntry(entryId, pkgName) {

    // validate parameters
    const check = verify.prefix(`${this.constructor.name}.getEntry() parameter violation: `);
    // ... entryId
    check(entryId,           'entryId is required');
    check(isString(entryId), 'entryId must be a string');
    // ... pkgName
    check(pkgName,           'pkgName is required');
    check(isString(pkgName), 'pkgName must be a string');

    // L8TR_pkgName: PRODUCTION IMPLEMENTATION, WITH pkgName
    //? // resolve the package containing the entry
    //? const smartPkg = this.pkgCatalog[pkgName];
    //? if (!smartPkg) {
    //?   return; // AI: consider throwing error if this package is NOT cataloged?
    //? }
    //? 
    //? // resolve the entry, if any (when defined in package)
    //? return smartPkg.getEntry(entryId, pkgName); // AI: may NOT need pkgName here

    // L8TR_pkgName: temporarily do resolution without pkgName so we can move forward (requires all entries to be globally unique)
    for (const smartPkg of this.pkgCatalogArrTemp) {
      const entry = smartPkg.getEntry(entryId, pkgName);
      if (entry) {
        return entry;
      }
    }
  }

}

// expose our single pkgManager utility ... AI: singleton code smell
const pkgManager = new PkgManager();
export default pkgManager;
