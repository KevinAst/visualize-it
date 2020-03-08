import verify      from 'util/verify';
import {isString}  from 'util/typeCheck';

/*-------------------------------------------------------------------------------
   
  ***********************************
  *** Resolve Circular Dependency ***
  ***********************************

  Do NOT IMPORT SmartPkg
  import SmartPkg from './SmartPkg';
  
  Because SmartPkg extends SmartModel, and SmartModel uses pkgManager,
  this module (pkgManager) cannot rely on SmartPkg!
  
  In other words we cannot import SmartPkg here!
   - Prior to this, loadPkg() was a method in PkgManager()
     and we worked around it (a hack) by insuring SmartPkg was expanded FIRST
     ... in src/index.js
         import 'core/SmartPkg'; // "Resolve Circular Dependency" by expanding this first
   - This is why we moved loadPkg() into a separate module (pkgPersist.js) 
     With this refactor, this hack is no longer needed!

-------------------------------------------------------------------------------*/

/**
 * PkgManager is the manager of ALL packages (SmartPkg)
 * loaded and maintained in the visualize-it system.
 *
 * Entries from one package can have dependencies on other external
 * packages (for example, a "system" package may contain component
 * instances from classes defined in a "component" package).
 * 
 * Because the pkgManager service is aware of all packages, it
 * provides a clearing house to resolve classRefs, during persistence
 * hydration ... see: `SmartModel.fromSmartJSON()`
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
   * This registration  occurs automatically when using `loadPkg()` (in pkgPersist.js)
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
    check(smartPkg.getPkgName,          'smartPkg must be a SmartPkg instance'); // use "duct type" check
  //check(smartPkg instanceof SmartPkg, 'smartPkg must be a SmartPkg instance'); // to avoid SmartPkg import (see: "Circular Dependency" note above)

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
   * Return the package (SmartPkg) registered to the supplied
   * `pkgName` (undefined for NOT registered).
   *
   * @param {string} pkgName - the package name to retrieve.
   *
   * @returns {SmartPkg} the package (SmartPkg) registered to the
   * supplied `pkgName` (undefined for NOT registered).
   */
  getPackage(pkgName) {

    // validate parameters
    const check = verify.prefix('PkgManager.getPackage() parameter violation: ');
    // ... pkgName
    check(pkgName,             'pkgName is required');
    check(isString(pkgName),   'pkgName must be a string');

    // return the package (if any)
    return this.pkgCatalog[pkgName];
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
