// ?? ?#: further refinement for Phase II
import {writable}        from 'svelte/store';
import verify            from '../../verify.js';
import checkUnknownArgs  from '../../checkUnknownArgs';
import {isString,
        isFunction}      from '../../typeCheck';

/**
 * A FieldChecker object orchestrates validation of an individual
 * field (input elm) of an html form.
 *
 * Please refer to `index.js` for an overview of this utility.
 */
export default class FieldChecker {

  /**
   * Create a FieldChecker.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - self's id (to be injected into the
   * corresponding form elm).
   *
   * @param {function} validationFn - the function that performs field
   * validation, triggered at various times.
   *   API:
   *    + validationFn(fieldValues): errMsgStr (return '' for valid)
   *      NOTE: All field values are passed as named parameters,
   *            supporting complex inner-dependent field validation
   *              EX:  validationFn({address, zip}) ...
   *            Typically you only access the single field being validated
   *              EX:  validationFn({address}) ...
   */
  constructor({id, validationFn, ...unknownArgs}={}) {
    // validate constructor parameters
    const check = verify.prefix(`FieldChecker(): constructor parameter violation: `);
    // ... id
    check(id,            'id is required');
    check(isString(id),  'id must be a string');
    // ... validationFn
    check(validationFn,             'validationFn is required');
    check(isFunction(validationFn), 'validationFn must be a function');
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // bind necessary methods to self's object, allowing them to be used as isolated functions
    this.action = this.action.bind(this);

    // define our data members
    this._id            = id;
    this._validationFn  = validationFn;
    this._form          = null; // defined later, via: FormChecker.registerFieldChecker(fieldChecker)
    this._touched       = false;
    this._cachedIsValid = 'UNKNOWN';
//  this._inputElm      = XXX; // ?# currently set by our svelte action, L8TR: provided as constructor param

    // setup our field-based error message (a reactive svelte store)
    this._errMsgStore   = writable(''); // ... the store
    this._errMsg        = '';           // ... the current value
                                        // ... subscribe to the store, syncing self's _errMsg current value
    const unsubscribe   = this._errMsgStore.subscribe( (errMsg) => this._errMsg = errMsg );
    // ?# when self's object instance is destroyed: call unsubscribe()
  }

  /**
   * Return self's id.
   */
  getId() {
    return this._id;
  }

  /**
   * Return the current value of this field.
   *
   * NOTE: Currently OBSOLETE since we always pass all values (in validationFn)
   *
   * @returns {string} the current value of this field.
   */
  getFieldValue() {
    return this.getForm().getFieldValues()[this.getId()];
  }

  /**
   * Return self's parent form.
   *
   * @returns {FormChecker} self's parent form.
   */
  getForm() {
    // ?# this is a central spot where we can check to insure our structure has been setup correctly
    //    ... USED when this structure is dynamically gleaned from the DOM hierarchy (driven by our action injection)
    //    ... if (!this._form) throw new Error(`*** ERROR *** Invalid FormChecker structure ... did you forget to apply the Xxx action on your form? ... (FieldChecker has NO parent FormChecker)`);
    return this._form;
  }

  /**
   * Register self's parent form.
   *
   * @param {FormChecker} form - self's parent form.
   */
  setForm(form) {
    // validate parameters
    const check = verify.prefix(`FormChecker[{id: '${this.getId()}'}].setForm(): parameter violation: `);
    // ... form
    check(form,                      'form is required');
    check(form.registerFieldChecker, 'form must be a FormChecker instance'); // ... use duck type check to avoid circular dependency import needed for `instanceof FormChecker` semantics

    // retain our parent form
    this._form = form;
  }

  /**
   * Return indicator as to whether the end user has "touched" (or
   * seen) self's field, as defined by the focus/blur semantics.
   * 
   * @returns {boolean} true: has been seen, false: has NOT been seen
   */
  hasTouched() {
    return this._touched;
  }

  /**
   * Validate self's field (as needed - in the right circumstances),
   * resulting in self's errMsg state being updated.
   */
  validate() {
    // field validation only occurs when:
    //  - this field has been touched by the user -OR-
    //  - a form submit has been attempted
    if (this.hasTouched() ||
        this.getForm().hasSubmitBeenAttempted()) {

      // interpret standard HTML Form Element Constraint Validation
      // ... ex:  <input type="text" required minlength="5">
      // ... see: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
      // ?# L8TR

      // perform app-specific field validation
      const fieldId     = this.getId();
      const fieldValues = this.getForm().getFieldValues();
      const errMsg      = this._validationFn(fieldValues);
      // ... verify app logic returns the correct errMsg type
      verify(isString(errMsg), `*** ERROR *** FieldChecker: return from validationFn() [for fieldId: '${fieldId}'] MUST be a string ... use an empty string ('') to designate valid`);

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
   * Style self's field to better distinguish errors.
   */
  styleFieldErr() {
    // errStyles are parameterized in our form
    const errStyles = this.getForm()._errStyles;

    // no-op when client has disabled errStyles
    if (!errStyles) {
      return;
    }
    
    // cache isValid status, and no-op when NOT changed (as an optimization)
    const isValid = this.isValid();
    if (isValid === this._cachedIsValid) {
      return;
    }
    this._cachedIsValid = isValid;

    // style any error status changes
    if (isValid) { // clear error settings
      // console.log(`XX styling form element '${this.getId()}' AS valid`);
      Object.entries(errStyles).forEach( ([propName, propValue]) => removeProp(this._inputElm.style, camel2dashes(propName)) );
      // EX: this._inputElm.style.removeProperty('background-color')
      // AI: CONSIDER retaining prior client-defined in-styles, to revert back to
      //     ... this would have to be done in constructor (once we know the properties we are dealing with - since it is parameterized)
      //         EX: this._clientInLineStyles: {...}
    }
    else { // field has an error
      // console.log(`XX styling form element '${this.getId()}' AS invalid`);
      Object.entries(errStyles).forEach( ([propName, propValue]) => this._inputElm.style[propName] = propValue );
    }
  }

  /**
   * Clear self's field-based error message.
   */
  clearErrMsg() {
    this.setErrMsg('');
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
   * A svelte action (to use with interactive html form input
   * elements) that establishes the necessary DOM binding for our
   * validation.
   */
  action(inputElm) {
    // validate parameters
    const check = verify.prefix(`${this.getId()}'s FieldChecker.action(): `);
    // ... inputElm
    check(inputElm, 'a DOM elm was expected (by svelte) but is missing ... something is wrong');
    check(['INPUT', 'SELECT', 'TEXTAREA'].indexOf(inputElm.nodeName) >= -1,
          `this svelte action should be used on an interactive form element, NOT a <${inputElm.nodeName.toLowerCase()}>`);

    // retain our inputElm (in support of needed DOM interactions)
    this._inputElm = inputElm; // ?# currently set by our svelte action, L8TR: provided as constructor param

    // console.log(`XX here we are in ${this.getId()}'s FieldChecker.action()! -and- here is the inputElm: `, {inputElm})

    //***
    //*** manage our DOM characteristics
    //***

    // <input id="{ourId}" ...>
    // ... CURRENTLY NOT NEEDED: it should NOT be necessary for this id to match ours ... ex: user may want to set for hooking into label, etc.
    //     ?# however L8TR: we want the user to set id ... we will glean the input dom ID for our FieldChecker that we create!!!
    //? check(!inputElm.hasAttribute('id'), 'the input element should NOT manage the id="x" attribute ... this is the job of FieldChecker');
    //? inputElm.setAttribute('id', true);

    // bind a "blur" event to the field, marking it as "touched"
    // <input on:blur={ourFn}>
    // ... NOTE: We really don't need to detect/prevent other on:blur events
    //           - the app logic may need this for other reasons
    //           - technically there is NO way to detect this
    // ... NOTE: There is NO NEED to prevent default behavior: e.preventDefault()
    //           - I'm not sure there is a default behavior for this event
    //           - I tried both ways with NO impact
    inputElm.addEventListener('blur', (e) => {
      e.preventDefault();
      // mark self as touched
      this._touched = true;

      // perform validation
      // ... if user comes in/out of field without changing, this may be the first validation of the field
      // ... we only need this local field to validate, because no values have changed (via this event)
      this.validate();
    });
    
    // bind an "input" event to the field, retaining it's current value and validate (as needed)
    // <input on:input={ourFn}>
    // ... NOTE: We really don't need to detect/prevent other on:input events
    //           - the app logic may need this for other reasons
    //           - technically there is NO way to detect this
    // ... NOTE: There is NO NEED to prevent default behavior: e.preventDefault()
    //           - I'm not sure there is a default behavior for this event
    //           - I tried both ways with NO impact
    inputElm.addEventListener('input', (e) => {
      // retain the latest field value in our form, which ALSO validates :-)
      // console.log(`XX FieldChecker.action()/on:input event fired: `, {event:e});
      this.getForm().changeFieldValue(this.getId(), e.target.value);
    });
  }

  /**
   * Provide symbolic representation of self.
   * 
   * @returns {string} a human consumable representation of self
   */
  toString() {
    return `FieldChecker: '${this.getId()}'`;
  }

}


//***
//*** Utilities
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
