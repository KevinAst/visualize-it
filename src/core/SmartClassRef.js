import verify     from 'util/verify';
import {isClass,
        isString} from 'util/typeCheck';

/**
 * SmartClassRef is a meta object that accommodates type/class
 * information for ALL smartObjects, unifying both real classes and
 * pseudo classes!
 *
 * A `smartClassRef` property is dynamically attached to all classes
 * (both real and pseudoClass) by the SmartPkg package manager.
 */
export default class SmartClassRef {

  /**
   * Create a SmartClassRef.
   *
   * @param {classRef} classRef - the class on which behalf we operate
   * (either a real class or a pseudoClass).
   *
   * @param {string} pkgName - the package name this class belongs to.
   */
  constructor(classRef, pkgName) {

    // validate parameters
    const check = verify.prefix('SmartClassRef() constructor parameter violation: ');

    // ... classRef (more validation below)
    check(classRef,          'classRef is required');

    // ... pkgName
    check(pkgName,           'pkgName is required');
    check(isString(pkgName), 'pkgName must be a string');


    // retain information about the supplied classRef
    // ... a realClass
    if (isClass(classRef)) {
      this.realClass = classRef;
    }
    // ... a pseudoClass
    else if (classRef.pseudoClass && classRef.pseudoClass.isType()) {
      this.pseudoClassContainer = classRef;
    }
    else {
      check(false, 'classRef must be a real class -or- pseudoClass');
    }

    // retain the supplied pkgName
    this.pkgName = pkgName;
  }


  /**
   * Return an indicator as to whether self is a real class
   *
   * @returns {boolean} true: a realClass, false: a pseudoClass
   */
  isClass() { // ?? suspect this is never used - the whole idea of this class is to remove conditional logic (verify and obsolete)
    return this.realClass ? true : false;
  }

  /**
   * Return an indicator as to whether self is a pseudo class
   *
   * @returns {boolean} true: a pseudoClass, false: a realClass
   */
  isPseudoClass() { // ?? suspect this is never used - the whole idea of this class is to remove conditional logic (verify and obsolete)
    return this.pseudoClassContainer ? true : false;
  }


  /**
   * Return the class name of self.
   * 
   * The class name is interpreted for BOTH real classes and
   * pseudoClasses.
   *
   * For real classes, the name is never mangled, from an
   * obfuscated production build.
   *
   * @returns {string} the class name.
   */
  getClassName() {
    // interpret a pseudoClass instance
    if (this.pseudoClassContainer) {
      return this.pseudoClassContainer.id;
    }

    // interpret our real class name
    return getRealClassName(this.realClass);
  }


  /**
   * Return the package name (SmartPkg) from which this classRef is
   * managed/distributed.
   *
   * @returns {string} the class package name.
   */
  getClassPkgName() {
    return this.pkgName;
  }


  /**
   * Return the fully qualified class name of self, including the
   * package and class name ... 'com.acme/Pump1'.
   *
   * @returns {string} self's fully qualified 'pkgName/className'
   */
  getFullClassName() {
    return `${this.getClassPkgName()}/${this.getClassName()}`;
  }


  /**
   * A value-added constructor that creates smartObjects of this type.
   *
   * These newly instantiated objects represent SmartModel
   * derivations, whose constructors supports namedParams.
   *
   * @param {ObjectLiteral} namedParams - The named properties used to
   * passed into self's constructor.
   *
   * @returns {smartObject} a newly instantiated class-based object of
   * this type, initialized with `namedParams`.
   */
  createSmartObject(namedParams) {

    //***
    //*** handle real classes
    //***

    if (this.realClass) {
      console.log(`?? ***INFO** SmartClassRef.createSmartObject() creating standard class: '${this.getFullClassName()}' ... using namedParams: `, namedParams);
      return new this.realClass(namedParams);
    }

    //***
    //*** handle pseudo classes
    //***

    const pseudoClassContainer = this.pseudoClassContainer;

    // clone the pseudoClass (with depth), overriding supplied namedParams
    const newObj = pseudoClassContainer.smartClone(namedParams);

    // AI: some of the following demarcations may have some "logical" duplication in it ... analyze this when the dust settles

    // mark the cloned object as an instance (NOT a type)
    newObj.pseudoClass.id   = pseudoClassContainer.id;
    newObj.pseudoClass.name = `a pseudoClass instance of type: '${pseudoClassContainer.id}'`; // for good measure
    console.log(`?? ***INFO** SmartClassRef.createSmartObject() created pseudoClass: '${this.getFullClassName()}' ... `, {namedParams, newObj});

    // retain the pseudoClassMaster
    newObj.pseudoClass.pseudoClassMaster = pseudoClassContainer;
    // ?? TEST ABOVE ... HMMMMM: I commented this out and rehydration still works (in both dup functions) ... more research needed

    return newObj;
  }

}


//******************************************************************************
//*** Internal Helper Functions
//******************************************************************************

/**
 * Return the real class name of the supplied "real" clazz.
 *
 * IMPORTANT: This routine utilizes the clazz.unmangledName -and-
 *            verifies it's existence!
 * - class name is crucial for our persistence (hydration invokes
 *   constructor matching registered classes)
 * - the standard class.name is mangled in our production build (ex:
 *   yielding 't' for 'SmartComp')
 * - this is a central spot that will highlight issues very early
 *
 * @param {class} clazz - the real class to interpret.
 *
 * @returns {string} the supplied clazz's class name.
 */
function getRealClassName(clazz) {

  // verify there is an unmangledName property (see IMPORTANT above)
  // NOTE: MUST USE hasOwnProperty() because static class references
  //       will walk the hierarchy chain (as of ES6 classes)
  //       We MUST insure this concrete class has defined it's own
  //       unique unmangledName!!
  if (!clazz.hasOwnProperty('unmangledName')) { // ?? this check would be better performed ONE TIME during self construction ?? therefore eliminating the need for this entire function
    throw new Error(`***ERROR*** class ${clazz.name} MUST have an "unmangledName" property (supporting persistence in obfuscated production build).`);
  }

  // that's all folks :-)
  return clazz.unmangledName;
}
