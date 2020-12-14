// ?? ?#: further refinement for Phase II
import {writable}        from 'svelte/store';
import FieldChecker      from './FieldChecker';
import verify            from '../../verify.js';
import checkUnknownArgs  from '../../checkUnknownArgs';
import {isString,
        isFunction}      from '../../typeCheck';

/**
 * A FormChecker object orchestrates validation of interactive html forms.
 *
 * Please refer to `index.js` for an overview of this utility.
 */
export default class FormChecker {

  /**
   * Create a FormChecker.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} name - self's name.
   *
   * @param {function} submitFn - an app-specific process
   * function, triggered by submit after all fields pass validation.
   *   API:
   *    + submitFn(event, fieldValues): void
   *
   * @param {FieldChecker[]} [fieldCheckers] - an optional set of
   * FieldCheckers managed by self.
   */
  constructor({name, submitFn, fieldCheckers=[], ...unknownArgs}={}) {
    // validate constructor parameters
    const check = verify.prefix(`FormChecker(): constructor parameter violation: `);
    // ... name
    check(name,            'name is required');
    check(isString(name),  'name must be a string');
    // ... submitFn
    check(submitFn,             'submitFn is required');
    check(isFunction(submitFn), 'submitFn must be a function');
    // ... fieldCheckers (optional - defaulted above)
    check(Array.isArray(fieldCheckers),  'fieldCheckers must be a FieldChecker[] array');
    fieldCheckers.forEach( (fieldChecker, indx) => {
      check(fieldChecker instanceof FieldChecker, `fieldCheckers[${indx}] must be a FieldChecker instance`);
    });
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // bind necessary methods to self's object, allowing them to be used as isolated functions
    this.action = this.action.bind(this);

    // define our data members
    this._name          = name;
    this._submitFn      = submitFn;
    this._fieldCheckers = [];
    this._fieldValues   = {}; // our field value cache - all values: {fieldId: value, ...} (accumulated via our fieldCheckers)
    this._hasSubmitBeenAttempted = false; // has user attempted a submit?

    // setup our form-based error message (a reactive svelte store)
    this._errMsgStore   = writable(''); // ... the store
    this._errMsg        = '';           // ... the current value
                                        // ... subscribe to the store, syncing self's _errMsg current value
    const unsubscribe   = this._errMsgStore.subscribe( (errMsg) => this._errMsg = errMsg );
    // ?# when self's object instance is destroyed: call unsubscribe()

    // register any supplied fieldCheckers
    fieldCheckers.forEach( (fieldChecker) => this.registerFieldChecker(fieldChecker) );
  }

  /**
   * Return self's name.
   */
  getName() {
    return this._name;
  }

  /**
   * Register the supplied fieldChecker to self.
   *
   * @param {FieldChecker} fieldChecker - the fieldChecker object to register.
   *
   * @returns {FieldChecker} the supplied fieldChecker just registered (for usage semantics).
   */
  registerFieldChecker(fieldChecker) {
    // validate parameters
    const check = verify.prefix(`FormChecker[{name: '${this.getName()}'}].registerFieldChecker(): parameter violation: `);
    // ... fieldChecker
    check(fieldChecker,                         'fieldChecker is required');
    check(fieldChecker instanceof FieldChecker, 'fieldChecker must be a FieldChecker instance');

    // supplied fieldChecker's ID must be unique
    const nonUniqueObj = this._fieldCheckers.find( (f) => f.getId() === fieldChecker.getId() );
    check(!nonUniqueObj, `supplied fieldChecker's ID ('${fieldChecker.getId()}') is NOT unique ... this ID already exists`);

    // register to self
    this._fieldCheckers.push(fieldChecker);

    // initialize this field in our field value cache
    // ?# AI: this empty string is NOT correct when the dom value has been pre-initialized
    //        ... need a FieldChecker.getDomValue() that drills into the DOM ... domElm.value
    this._fieldValues[fieldChecker.getId()] = '';

    // maintain the parent form
    fieldChecker.setForm(this);
  }

  /**
   * Retain the supplied field value, triggering necessary validation.
   *
   * NOTE: This method is driven by value changes at the field level :-)
   *
   * @param {string} fieldId - the field identifier to set
   * @param {any} value - the value to set
   */
  changeFieldValue(fieldId, value) {
    // retain the latest field value in our cache
    this._fieldValues[fieldId] = value;

    // trigger necessary validation
    // ... NOTE: because field validation can involve inner-dependent fields,
    //           the entire form is validated (i.e. all fields - per the right conditions)
    this.validate();
  }

  /**
   * Return the current values of all our fields.
   *
   * @returns {FieldValueMap} a key/value map of all our fields: {fieldId: value, ...}
   */
  getFieldValues() {
    return this._fieldValues;
  }

  /**
   * Validate all fields of the form (as needed - in the right circumstances).
   * resulting in the errMsg state being updated for ALL our fields!
   */
  validate() {
    // clear our single form error (for aesthetics)
    // ... form-based errMsg is set in our submit process
    this.clearErrMsg();

    // validate all fields of self
    // NOTE: field validation is conditional (in the right circumstances)
    this._fieldCheckers.forEach( (fieldChecker) => fieldChecker.validate() );

    // NOTE: For form-based validation, we do NOT directly sync our form-based errMsg!
    //       This is accomplished in the submit process (when field errors are detected)
  }

  /**
   * Return self's form-based error message reactive store.
   * 
   * @returns {StoreContainingStr} self's form-based error message reactive store
   */
  getErrMsgStore() {
    return this._errMsgStore;
  }

  /**
   * Return self's form-based error message.
   * 
   * @returns {string} self's form-based error message.
   */
  getErrMsg() {
    // NOTE: this field is synced with our corresponding store (via a subscription)
    return this._errMsg;
  }

  /**
   * Set self's form-based error message (via our reactive store).
   * 
   * @param {string} errMsg - the error message to set.
   */
  setErrMsg(errMsg) {
    // NOTE: This is accomplished through our reactive store, 
    //       which in turn syncs our current value (_errMsg)
    this._errMsgStore.set(errMsg);
  }

  /**
   * Clear self's form-based error message.
   */
  clearErrMsg() {
    this.setErrMsg('');
  }

  /**
   * Return indicator as to whether self's form is currently valid.
   * 
   * @returns {boolean} true: valid, false: invalid
   */
  isValid() {
    // NOTE: Unlike fields, our form isValid() is NOT based on it's errMsg.
    //       RATHER we defer to our accumulative field validation.
    //       Our errMsg is set through our submit process.
    const isFormValid = this._fieldCheckers.reduce( (accum, fieldChecker) => accum && fieldChecker.isValid(), true);
    return isFormValid;
  }

  /**
   * Return indicator as to whether a form submit has been attempted
   * (i.e. the user has issued a submit).
   * 
   * @returns {boolean} true: submit has been attempted, false: otherwise
   */
  hasSubmitBeenAttempted() {
    return this._hasSubmitBeenAttempted;
  }

  /**
   * A svelte action (to use on html <form>) that establishes the
   * necessary DOM binding for our validation.
   */
  action(formElm) {
    // validate parameters
    const check = verify.prefix(`${this.getName()}'s FormChecker.action(): `);
    // ... formElm
    check(formElm,                     'a DOM elm was expected (by svelte) but is missing ... something is wrong');
    check(formElm.nodeName === 'FORM', `this svelte action should be used on a <form> element, NOT a <${formElm.nodeName.toLowerCase()}>`);

    // console.log(`XX here we are in ${this.getName()}'s FormChecker.action()! -and- here is the formElm: `, {formElm})

    //***
    //*** manage our DOM characteristics
    //***

    // <form novalidate ...>
    // ... we perform all field validation :-)
    check(!formElm.hasAttribute('novalidate'), 'the <form> element should NOT manage the "novalidate" attribute ... this is the job of FormChecker');
    formElm.setAttribute('novalidate', true);

    // <form on:submit={ourFn}>
    // ... NOTE: there is NO WAY to determine if an event has already been registered
    formElm.addEventListener('submit', (e) => {
      // prevent default behavior - we do NOT want to submit anything (over the web)
      e.preventDefault();

      // mark form submit attempted
      // ... this opens the flood gates that forces ALL field validation
      this._hasSubmitBeenAttempted = true;

      // validate ALL fields in this form
      this.validate();

      // conditionally invoke our app logic submit process (when our form is valid)
      // ... also set our form-based errMsg, based on the overall validity of ALL our fields
      if (this.isValid()) { // ... our form is valid
        this.clearErrMsg();

        // invoke our app logic submit process
        const fieldValues = this.getFieldValues();
        // console.log(`XX submitFn() invoked: `, {event: e, fieldValues});
        this._submitFn(e, fieldValues);
      }
      else { // ... our form is invalid
        this.setErrMsg('Please correct the highlighted field errors'); // ?# configuration opportunity
        // console.log(`XX submitFn() NOT invoked: our form is invalid`);
      }
    });
  }

  /**
   * Provide symbolic representation of self.
   * 
   * @returns {string} a human consumable representation of self
   */
  toString() {
    return this._fieldCheckers.reduce((accum, fieldChecker) => accum + '\n  - ' + fieldChecker,
                                      `FormChecker: '${this.getName()}'`);
  }

}
