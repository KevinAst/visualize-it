// ?? ?#: further refinement for Phase II
// ?? ?%: DOM-BASED-CLEANUP: once we restructure to be DOM-based (where FieldChecker is independent of FormChecker) this will be cleaned up!

// ?? check imports
import {writable}        from 'svelte/store';
import verify            from '../../verify.js';
import checkUnknownArgs  from '../../checkUnknownArgs';
import {isString,
        isFunction}      from '../../typeCheck';

/**
 * A FieldChecker object orchestrates validation of an individual
 * field (an interactive html form element).
 */
export default class FieldChecker {

  /**
   * Create a FieldChecker.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} fieldName - our identifying fieldName, driving
   * key/value pairs for fieldValues/fieldErrors, etc.  The fieldName
   * is derived from the form element name/id attribute (name takes
   * precedence).
   *
   * ??$$ NEW inputElm
   *
   * @param {function} [validate] - optionally, a validate function
   * applying custom client-specific validation to this field.
   * 
   *   API:
   *    + validate(fieldValues): errMsgStr (use '' for valid)
   *      NOTE: All field values are passed as named parameters,
   *            supporting complex inner-dependent field validation
   *              EX: validate({address, zip}) ...
   *            Typically you only access the single field being validated
   *              EX: validate({address}) ...
   *
   * ??$$ DO THIS HERE (with newly available this._inputElm)
   * @param {function} interpretDomConstraintValidation - a helper function
   * that interpret the standard "HTML Form Element Constraint Validation".
   * 
   *   API:
   *    + interpretDomConstraintValidation(): errMsgStr (use '' for valid)
   *
   * @param {function} getDomFieldValue - a helper function that
   * returns the current DOM value of this field (handling BOTH
   * svelte-bound -and- non-bound fields).
   * 
   *   API:
   *    + getDomFieldValue(): value
   *
   * @param {function} initializeDomFieldValue - a helper function
   * that initialize the field value's DOM representation (handling
   * BOTH svelte-bound -and- non-bound fields).  This function should no-op
   * when NO initialValue was supplied by the client.
   * 
   *   API:
   *    + initializeDomFieldValue(): void
   */
  constructor({fieldName, validate, interpretDomConstraintValidation, getDomFieldValue, initializeDomFieldValue}={}) {
    // define our data members
    this._fieldName                        = fieldName;
    this._validate                         = validate;
    this._interpretDomConstraintValidation = interpretDomConstraintValidation;
    this._getDomFieldValue                 = getDomFieldValue;
    this._initializeDomFieldValue          = initializeDomFieldValue;

    this._parentForm    = null;      // defined later, via: setParentForm()
    this._touched       = false;
    this._cachedIsValid = 'UNKNOWN'; // a cached boolean isValid, with a "3rd" unknown state

    // setup our field-based error message (a reactive svelte store)
    this._errMsgStore   = writable(''); // ... the store
    this._errMsg        = '';           // ... the current value
    // ... subscribe to the store, syncing self's _errMsg current value
    const unsubscribe   = this._errMsgStore.subscribe( (errMsg) => this._errMsg = errMsg );
    // ?# when self's object instance is destroyed: call unsubscribe()
  }

  /**
   * Return self's fieldName.
   *
   * @returns {string} self's fieldName.
   */
  getFieldName() {
    return this._fieldName;
  }

  /**
   * Return the current value of this field.
   *
   * NOTE: Currently OBSOLETE since we always pass all values (in validate)
   *       ?? SUSPECT THIS IS NO LONGER TRUE
   *
   * @returns {any} the current value of this field.
   */
  getFieldValue() {
    return this._getDomFieldValue();
  }

  /**
   * Return self's parent form.
   *
   * @returns {FormChecker} self's parent form.
   */
  getParentForm() {
    // ?# this is a central spot where we can check to insure our structure has been setup correctly
    //    ... USED when this structure is dynamically gleaned from the DOM hierarchy (driven by our action injection)
    //    ... if (!this._parentForm) throw new Error(`*** ERROR *** Invalid FormChecker structure ... did you forget to apply the Xxx action on your form? ... (FieldChecker has NO parent FormChecker)`);
    return this._parentForm;
  }

  /**
   * Register self's parent form.
   *
   * @param {FormChecker} form - self's parent form.
   */
  setParentForm(parentForm) {
    // validate parameters
    const check = verify.prefix(`FieldChecker[{name: '${this.getFieldName()}'}].setParentForm(): parameter violation: `);
    // ... parentForm
    check(parentForm,                      'parentForm is required');
    check(parentForm.registerFieldChecker, 'parentForm must be a FormChecker instance');
    // ... above uses duck type check to avoid circular dependency import needed for `instanceof FormChecker` semantics
    //     ?? does FormChecker need to import FieldChecker now (after refactor)?

    // retain our parentForm
    this._parentForm = parentForm;
  }

  // ?? reset() HERE

  /**
   * Return indicator as to whether the end user has "touched" (or
   * seen) self's field, as defined by the focus/blur semantics.
   * 
   * @returns {boolean} true: has been seen, false: has NOT been seen
   */
  hasFieldBeenTouched() {
    return this._touched;
  }


  /**
   * Mark self's field as "have been touched", triggering validation on first touch.
   */
  markFieldAsTouched() {

    // determine if this is the first time the field has been touched
    const firstTouch = !this._touched;
    
    // mark self as touched
    this._touched = true;
    
    // on first touch, validate this field only
    // ... technically, the 'blur' event does NOT represent a change to the field
    // ... HOWEVER, when the user merely goes in/out of a field without changing it,
    //     then it has been seen, and may represent the first time validation should occur
    if (firstTouch) {
      this.validate();
    }
  }

  /**
   * Return indicator as to whether self's field is currently valid.
   * 
   * @returns {boolean} true: valid, false: invalid (see corresponding getErrMsg())
   */
  isValid() {
    return this.getErrMsg() ? false : true;
  }

  /**
   * Validate self's field (as needed - in the right circumstances),
   * resulting in self's errMsg state being updated.
   */
  validate() {
    // field validation only occurs when:
    //  - this field has been touched by the user -OR-
    //  - a form submit has been attempted
    if (this.hasFieldBeenTouched() ||
        this.getParentForm().hasSubmitBeenAttempted()) {

      // interpret the standard "HTML Form Element Constraint Validation"
      // ... ex: <input type="text" required minlength="5">
      let errMsg = this._interpretDomConstraintValidation(); // ... will return '' when CLEAN

      // perform app-specific field validation
      if (!errMsg &&        // ... when the standard "HTML Form Element Constraint Validation" IS CLEAN
          this._validate) { // ... and when app supplied
        const fieldName   = this.getFieldName();
        const fieldValues = this.getParentForm().getFieldValues();
        errMsg            = this._validate(fieldValues);
        // ... verify app logic returns the correct errMsg type
        verify(isString(errMsg), `*** ERROR *** FieldChecker: return from validate() [for fieldName: '${fieldName}'] MUST be a string ... use an empty string ('') to designate valid`);
      }

      // sync self's errMsg
      // ... can be '': VALID -or 'whatever': INVALID
      this.setErrMsg(errMsg);
    }
  }

  /**
   * Return self's field-based error message reactive store.
   * 
   * @returns {StoreContainingStr} self's field-based error message reactive store
   */
  getErrMsgStore() {
    return this._errMsgStore;
  }

  /**
   * Return self's field-based error message.
   * 
   * @returns {string} self's field-based error message.
   */
  getErrMsg() {
    // NOTE: this field is synced with our corresponding store (via a subscription)
    return this._errMsg;
  }

  /**
   * Set self's field-based error message (via our reactive store).
   * 
   * @param {string} errMsg - the error message to set.
   */
  setErrMsg(errMsg) {
    // set field's error message
    // ... this is accomplished through our reactive store, 
    //     which in turn syncs our current value (_errMsg)
    this._errMsgStore.set(errMsg);

    // style our field to better distinguish errors
    this.styleFieldErr();
  }

  /**
   * Clear self's field-based error message.
   */
  clearErrMsg() {
    this.setErrMsg('');
  }

  /**
   * Style self's field to better distinguish errors.
   */
  styleFieldErr() {
    // errStyles are parameterized in our form
    const errStyles = this.getParentForm()._errStyles;

    // no-op when client has disabled errStyles
    if (!errStyles) {
      return;
    }
    
    // no-op when our isValid status has NOT changed (an optimization)
    // ... employing our _cachedIsValid
    const isValid = this.isValid();
    if (isValid === this._cachedIsValid) {
      return;
    }
    this._cachedIsValid = isValid;

    // style error status
    if (isValid) { // ... clear error styles
      // console.log(`XX styling form element '${this.getFieldName()}' AS valid`);
      Object.entries(errStyles).forEach( ([propName, propValue]) => {
        // EX: this._inputElm.style.removeProperty('background-color')
        removeProp(this._inputElm.style, camel2dashes(propName))
      });
      // AI: CONSIDER retaining prior client-defined in-styles, to revert back to
      //     ... this would have to be done in constructor (once we know the properties we are dealing with - since it is parameterized)
      //         EX: this._clientInLineStyles: {...}
    }
    else { // ... apply error styles
      // console.log(`XX styling form element '${this.getFieldName()}' AS invalid`);
      Object.entries(errStyles).forEach( ([propName, propValue]) => {
        this._inputElm.style[propName] = propValue
      });
    }
  }

  /**
   * Provide symbolic representation of self.
   * 
   * @returns {string} a human consumable representation of self
   */
  toString() {
    return `FieldChecker: '${this.getFieldName()}'`;
  }

  // ?? RETROFIT ????????????????????????????????????????????????????????????????????????????????
  // ?? use this._initializeDomFieldValue
}


//***
//*** Common Utilities
//***

// remove the supplied objs property (supporting older browsers)
function removeProp(obj, propName) {
  if (obj.removeProperty) {
    obj.removeProperty(propName);
  }
  else {
    obj.removeAttribute(propName);
  }
}

// convert supplied camelStr to dashes
// ... example: FROM: 'backgroundColor' TO: 'background-color'
function camel2dashes(camelStr) {
  return camelStr.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
}
