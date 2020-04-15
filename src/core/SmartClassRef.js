import verify          from 'util/verify';
import {isClass,
        isString}      from 'util/typeCheck';
import {createLogger}  from 'util/logger';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** SmartClassRef:').disable();

/**
 * SmartClassRef is a meta object that accommodates type/class
 * information for ALL smartObjects, unifying both real classes and
 * pseudo classes!
 *
 * SmartClassRef meta objects can represent either:
 *
 *  - a real class ... of type SmartModel whose constructor supports
 *    namedProps,
 * 
 *  - or a pseudoClass ... an object instance that logically
 *    represents a class.  These are resource-based objects that can
 *    be dynamically edited (through the graphical editor), and yet
 *    can be "instantiated" as items of other objects!  Please refer
 *    to PseudoClass.
 *
 * A `smartClassRef` property is dynamically attached to all classes
 * (both real and pseudoClass) by the SmartPkg package manager.
 *
 * IMPORTANT: This class verifies the existence of class.unmangledName!
 * - class name is crucial for our persistence (hydration invokes
 *   constructor matching registered classes)
 * - the standard class.name is mangled in our production build (ex:
 *   yielding 't' for 'SmartComp')
 * - this is a central spot that will highlight issues very early
 */
export default class SmartClassRef {

  /**
   * Create a SmartClassRef.
   *
   * @param {classRef} classRef - the class on which behalf we operate
   * (either a real class or a pseudoClass).
   *
   * @param {string} pkgId - the package ID this class belongs to.
   */
  constructor(classRef, pkgId) {

    // validate parameters
    const check = verify.prefix('SmartClassRef() constructor parameter violation: ');

    // ... classRef (more validation below)
    check(classRef,          'classRef is required');

    // ... pkgId
    check(pkgId,           'pkgId is required');
    check(isString(pkgId), 'pkgId must be a string');


    // retain information about the supplied classRef
    // ... a realClass
    if (isClass(classRef)) {
      this.realClass = classRef;

      // verify there is an unmangledName property (see IMPORTANT above)
      // NOTE: MUST USE hasOwnProperty() because static class references
      //       will walk the hierarchy chain (as of ES6 classes)
      //       We MUST insure this concrete class has defined it's own
      //       unique unmangledName!!
      check(classRef.hasOwnProperty('unmangledName'), `real class ${classRef.name} MUST have an "unmangledName" property (supporting persistence in obfuscated production build)`);

    }
    // ... a pseudoClass MASTER (i.e. a logical type)
    else if (classRef.pseudoClass && classRef.pseudoClass.isType()) {
      this.pseudoClassContainer = classRef;
    }
    else {
      check(false, 'classRef must be a real class -or- pseudoClass');
    }

    // retain the supplied pkgId
    this.pkgId = pkgId;
  }


  /**
   * Return an indicator as to whether self is a real class
   *
   * NOTE: This method should have minimal use (the whole idea of self's
   * class is to remove conditional logic)!
   *
   * @returns {boolean} true: a realClass, false: a pseudoClass
   */
  isClass() {
    return this.realClass ? true : false;
  }

  /**
   * Return an indicator as to whether self is a pseudo class
   *
   * NOTE: This method should have minimal use (the whole idea of self's
   * class is to remove conditional logic)!
   *
   * @returns {boolean} true: a pseudoClass, false: a realClass
   */
  isPseudoClass() {
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
    // interpret a pseudoClass type
    // ... self is a pseudoClass MASTER (i.e. a logical type)
    if (this.pseudoClassContainer) {
      return this.pseudoClassContainer.id;
    }

    // interpret our real class name
    return this.realClass.unmangledName || this.realClass.name;
  }


  /**
   * Return the package ID (SmartPkg) from which this classRef is
   * managed/distributed.
   *
   * @returns {string} the class package ID.
   */
  getClassPkgId() {
    return this.pkgId;
  }


  /**
   * Return the fully qualified class name of self, including the
   * package ID and class name ... 'com.acme/Pump1'.
   *
   * @returns {string} self's fully qualified 'pkgId/className'
   */
  getFullClassName() {
    return `${this.getClassPkgId()}/${this.getClassName()}`;
  }

  /**
   * Return the current crc hash for self's class, considered a class
   * version, used in detecting out-of-sync classes (see
   * SmartModel.isClassOutOfSync()).
   *
   * Currently, this is only operational for pseudo classes.  Real
   * code-based class versioning is not currently tracked, and will
   * always return a zero (0), indicating they are in-sync.
   *
   * @returns {number} self's class versioning crc hash.
   */
  getClassVersionCrc() {
    // interpret a pseudoClass type
    // ... self is a pseudoClass MASTER (i.e. a logical type)
    if (this.pseudoClassContainer) {
      return this.pseudoClassContainer.getCrc();
    }

    // interpret our real class name
    // ... we don't currently track versioning of real classes (every class version is zero)
    return 0;
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

    let newObj = null;
    let msgQualifier = '';

    //***
    //*** handle real classes
    //***

    if (this.realClass) {
      msgQualifier = 'real';
      newObj = new this.realClass(namedParams);
    }

    //***
    //*** handle pseudo classes
    //***

    else {
      msgQualifier = 'pseudo';

      const pseudoClassContainer = this.pseudoClassContainer;

      // clone the pseudoClass (with depth), overriding supplied namedParams
      newObj = pseudoClassContainer.smartClone(namedParams);

      // AI: some of the following demarcations may have some "logical" duplication in it ... analyze this when the dust settles

      // mark the cloned object as an instance (NOT a type)
      newObj.pseudoClass.id   = pseudoClassContainer.id;
      newObj.pseudoClass.name = `a pseudoClass instance of type: '${pseudoClassContainer.id}'`; // for good measure

      // retain the pseudoClassMaster
      // ... used to locate the pseudoClass from which an object was created :-)
      // ... see: SmartModel.getClassRef()
      newObj.pseudoClass.pseudoClassMaster = pseudoClassContainer;

      // retain the version crc hash of the pseudoClassMaster used in our construction
      // ... used to detect out-of-sync class when dynamic classes change during interactive edit session
      // ... see: SM.isClassOutOfSync()
      newObj.pseudoClass.versionCrcUsedInCreation = pseudoClassContainer.getCrc();
    }

    log(`createSmartObject() created new object from ${msgQualifier} class: '${this.getFullClassName()}' ... using namedParams: `, {namedParams, newObj});
    return newObj;
  }

}
