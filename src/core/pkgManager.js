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
   * interactive file picker dialog will be presented.
   *
   * @returns {SmartPkg via Promise} the newly loaded package
   * (undefined when user cancels the picker dialog).
   * 
   * @throws {Error} an Error is thrown in various scenarios
   * (pkgResourcePath not found, uninterpretable resource content,
   * invalid params, etc.).
   */
  async loadPkg(pkgResourcePath) {
    // validate parameters
    const check = verify.prefix(`${this.constructor.unmangledName}.loadPkg() parameter violation: `);

    // ... pkgResourcePath (when supplied)
    if (pkgResourcePath) {
      check(pkgResourcePath,       'currently only handles "interactive file picker dialog" ... do NOT know how to handle a pkgResourcePath param yet :-('); // AI: temp for now
      check(pkgResourcePath===123, 'pkgResourcePath (when supplied) must be a YetUnknown'); // AI: future TEMPLATE
    }
    else {
      // insure we have access to the "Native File System API TRIAL"
      if (!window.chooseFileSystemEntries) {
        throw new Error(`***ERROR*** ${this.constructor.unmangledName}.loadPkg() the "Native File System API TRIAL" is NOT available in this environment :-(`)
          .defineAttemptingToMsg('use the interactive file picker dialog');
      }
    }

    // define our fileHandle
    // ... AI: determine how to retain a neutral version of this resource, for "save" operations (possibly in loaded SmartPkg)
    let fileHandle = null;

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

    // ... when pkgResourcePath IS supplied, AI: figure this out
    if (pkgResourcePath) {
      // NOTE: currently errors out (in parameter validation above)
    }
    // ... when pkgResourcePath NOT supplied, select the fileHandle via an interactive file picker dialog
    else {
      try {
        fileHandle = await window.chooseFileSystemEntries();
      }
      catch(err) {
        // prune expected errors
        if (err.message === 'The user aborted a request.') { // ... user canceled request
          return; // return undefined when user cancels the picker dialog (as documented above)
        }
        // re-throw "qualified" unexpected errors
        throw err.defineAttemptingToMsg('use the file picker dialog');
      }
    }

    // load the file blob
    // ... NOTE: file is w3c - https://w3c.github.io/FileAPI/#dfn-file
    // ... for now, just pass through unexpected errors
    const file = await fileHandle.getFile();

    // resolve the file content
    // ... see: https://w3c.github.io/FileAPI/#text-method-algo
    // ... for now, just pass through unexpected errors
    const fileContent = await file.text();

    // resolve content to json
    let smartJSON = null
    try {
      smartJSON = JSON.parse(fileContent);
    }
    catch(err) { // SyntaxError
      // something about err emitted from JSON, doesn't show attemptingToMsg in discloseError() detail
      // >>> throw err.defineAttemptingToMsg(`interpret resource as smartJSON in ${this.constructor.unmangledName}.loadPkg()`);
      // ... suspect it is somehow NOT purely Error based (not really sure what this is)
      // ... for now re-create it, but concerned may loose something out of the original
      throw new Error(`INVALID JSON - ${err.message}`)
        .defineUserMsg('Please select a valid visualize-it package'); // consider this a user error (in their selection)
    }

    // resolve to a SmartPkg
    // ... this auto adorns .defineAttemptingToMsg()
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
   *
   * @throws {Error} an Error is thrown when the package is already loaded
   */
  registerPkg(smartPkg) { // AI: handle 2nd pkgResourcePath param ... I think we want pkgResourcePath to be part of SmartPkg

    // validate parameters
    const check = verify.prefix(`${this.constructor.unmangledName}.registerPkg() parameter violation: `);

    // ... smartPkg
    check(smartPkg,                     'smartPkg is required');
    check(smartPkg instanceof SmartPkg, 'smartPkg must be a SmartPkg instance');

    // maintain our package catalog
    const pkgName = smartPkg.getPkgName();
    // console.log(`xx PkgManager.registerPkg() registering smartPkg(${pkgName}): `, smartPkg);
    if (this.pkgCatalog[pkgName]) { // verify smartPkg is not already loaded
      throw new Error(`***ERROR*** ${this.constructor.unmangledName}.registerPkg() pkgName: ${pkgName} is already registered :-(`)
        .defineUserMsg(`The visualize-it '${pkgName}' package is already loaded`); // AI: we may need to conditionally refresh existing packages (per user confirmation)
    }
    this.pkgCatalog[pkgName] = smartPkg;
  }


  /**
   * Resolve classRefs managed in self's packages.
   *
   * NOTE: This accessor is commonly used in the rehydration process
   *       (SmartModel.fromSmartJSON()) to resolve classes at a low level.
   *
   * @param {string} pkgName - the package name that the class belongs to.
   * @param {string} className - the class name of the classRef to return.
   *
   * @returns {SmartClassRef} the classRef matching the supplied `pkgName`/`className`
   *
   * @throws {Error} an Error is thrown when the class was not resolved.
   */
  getClassRef(pkgName, className) {

    // validate parameters
    const check = verify.prefix('PkgManager.getClassRef() parameter violation: ');
    // ... pkgName
    check(pkgName,             'pkgName is required');
    check(isString(pkgName),   'pkgName must be a string');
    // ... className
    check(className,           'className is required');
    check(isString(className), 'className must be a string');

    // resolve the package containing the class
    const smartPkg = this.pkgCatalog[pkgName];
    if (!smartPkg) { // this is an expected condition (communicate to user via defineUserMsg())
      throw new Error(`***ERROR*** PkgManager.getClassRef(pkgName:${pkgName}, className:${className}) package is NOT cataloged ... did you forget to load a dependent package?`)
        .defineUserMsg(`The '${pkgName}/${className}' class has been referenced, but the '${pkgName}' package has NOT been loaded ... did you forget to load this dependent package?`);
    }
    
    // resolve the classRef
    const classRef = smartPkg.getClassRef(className);
    if (!classRef) { // this is more of an unexpected condition
      throw new Error(`***ERROR*** PkgManager.getClassRef(pkgName:${pkgName}, className:${className}) class NOT in package :-(`);
    }
    return classRef;
  }

  /**
   * Resolve entries managed in self's packages.
   *
   * NOTE: This accessor was thought to be used by the tabManager to resolve
   *       entries at a low level, however it is currently not needed.
   *       ... as of 2/16/2020, this method NOT being used.
   *
   * @param {string} pkgName - the package name that the entry belongs to.
   * @param {string} entryId - the entry ID of the entry to return.
   *
   * @returns {entry} the entry matching the supplied params,
   * undefined for not-found.
   */
  getEntry(pkgName, entryId) {

    // validate parameters
    const check = verify.prefix('PkgManager.getEntry() parameter violation: ');
    // ... pkgName
    check(pkgName,           'pkgName is required');
    check(isString(pkgName), 'pkgName must be a string');
    // ... entryId
    check(entryId,           'entryId is required');
    check(isString(entryId), 'entryId must be a string');

    // resolve the package containing the entry
    const smartPkg = this.pkgCatalog[pkgName];
    if (!smartPkg) {
      return;
    }
    
    // resolve the entry, if any (when defined in package)
    return smartPkg.getEntry(entryId);
  }

}
PkgManager.unmangledName = 'PkgManager';

// expose our single pkgManager utility ... AI: singleton code smell
const pkgManager = new PkgManager();
export default pkgManager;
