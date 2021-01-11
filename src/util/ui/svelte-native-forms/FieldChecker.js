// ?? ?#: further refinement for Phase II
// ?? ?%: DOM-BASED-CLEANUP: once we restructure to be DOM-based (where FieldChecker is independent of FormChecker) this will be cleaned up!
import {writable}        from 'svelte/store';
import verify            from '../../verify.js';
import {isString,
        isPlainObject,
        isFunction}      from '../../typeCheck';

/**
 * A FieldChecker object orchestrates validation of an individual
 * field (an interactive html form element).
 *
 * **NOTE**: FieldChecker object instances are a thin layer on top of
 *           the fieldCheckerAction.  As a result, you will see public
 *           facing items (such as Errors) reflect
 *           "fieldCheckerAction" nomenclature.
 */
export default class FieldChecker {

  /**
   * Create a FieldChecker.
   *
   * **NOTE**: This constructor has the SAME signature of fieldCheckerAction.
   *
   * @param {DOMElm} inputElm - the interactive form element for field
   * we are monitoring (supplied by svelte).
   *
   * **Please Note**: Subsequent to the inputElm parameter (supplied by svelte),
   *                  named parameters are in use (supplied by client).
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
   * @param {any} [initialValue] - optionally, the initial value to
   * apply to this field ... on DOM creation and reset() functionality.
   *
   * @param {any} [boundValue] - optionally, the application variable
   * bound to this inputElm (required when svelte's bind:value is in
   * affect).  This is needed due to a web limitation where updates to
   * inputElm.value (how svelte maintains the two-way binding) does NOT
   * emit 'on:input' events (how we typically monitor change -
   * triggering validation).
   *
   * @param {function} [changeBoundValue] - optionally, a client
   * function that changes it's bound value (required when BOTH
   * initialValue and boundValue are supplied).  This is needed to apply
   * the initialValue of bounded entries, because the svelte complier
   * must have visibility of this change (via this client function).
   * 
   *   API: 
   *     + changeBoundValue(initialValue): void (updating client boundValue to the supplied `initialValue`)
   */
  constructor(inputElm, clientParams={}) {

    //***
    //*** validate supplied parameters
    //***

    const check = verify.prefix('fieldCheckerAction parameter violation: ');

    // inputElm:
    check(inputElm, 'a DOM elm was expected (by svelte) but is missing ... something is wrong');
    check(['INPUT', 'SELECT', 'TEXTAREA'].indexOf(inputElm.nodeName) >= -1,
          `this svelte action should be used on an interactive form element, NOT a <${inputElm.nodeName.toLowerCase()}>`);

    // clientParams:
    check(isPlainObject(clientParams), "client supplied parameters should be named parameters (ex: {validate, initialValue: 'abc'})");
    // ... descturcture our individual clientParams (i.e. named parameters)
    const {validate,
           initialValue,
           boundValue,
           changeBoundValue,
           ...unknownNamedArgs} = clientParams;

    // retain all parameters in self
    // ... this is done early (prior to complete validation), 
    //     so as to activate various methods
    //     (like initialValueSupplied() and boundValueSupplied())
    this._inputElm         = inputElm;
    this._validate         = validate;
    this._initialValue     = initialValue;
    this._boundValue       = boundValue;
    this._changeBoundValue = changeBoundValue;

    // validate:
    check(validate && isFunction(validate),  'validate (when supplied) must be a function');

    // initialValue: NO VALIDATION NEEDED (any value is acceptable)

    // boundValue: NO VALIDATION NEEDED (any value is acceptable)

    // changeBoundValue:
    if (this.initialValueSupplied() && this.boundValueSupplied()) {
      check(changeBoundValue,             'changeBoundValue is required when initialValue and boundValue are supplied');
      check(isFunction(changeBoundValue), 'changeBoundValue must be a function');
    }
    else {
      check(!changeBoundValue, 'changeBoundValue is ONLY NEEDED when BOTH initialValue and boundValue are supplied');
    }

    // unrecognized positional parameter
    // NOTE: when defaulting entire struct, arguments.length is 0
    // ... prob an overkill, since svelte is in control of this API
    check(arguments.length <= 2, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

    // unrecognized named parameter
    const unknownArgKeys = Object.keys(unknownNamedArgs);
    check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);


    //***
    //*** continue initialization (our parameters are valid)
    //***

    // extract our fieldName from elm.name (takes precedence) -or- elm.id
    this._fieldName = inputElm.getAttribute('name') || inputElm.getAttribute('id');
    check(this._fieldName, 'our fieldName is derived from the form elements name attribute (takes precedence) -or- id attribute (this form element has neither attribute)');

    // retain additional state in self
    this._parentForm    = null;      // defined later via: registerParentForm()
    this._touched       = false;
    this._cachedIsValid = 'UNKNOWN'; // a cached boolean isValid, with a "3rd" unknown state

    // setup our field-based error message (a reactive svelte store)
    // ... the current value
    this._errMsg = '';
    // ... the reflexive store
    this._errMsgStore = writable('', () => { // ?? clean-up function is new: MUST TEST THIS OUT
      console.log(`?? fieldCheckerAction field: ${this.getFieldName()} errMsgStore registered it's FIRST subscriber!`);
      return () => {
        // clear our action's errMsgStore state on LAST subscription
        // ... we can do this because self's FieldChecker is a subscriber
        //     SO if the subscription goes to zero, our object HAS BEEN DESTROYED!
        console.log(`?? fieldCheckerAction field: ${this.getFieldName()} errMsgStore un-registered it's LAST subscriber ... clearing our action's errMsgStore state!`);
        this._errMsg      = 'OBSOLETE - the fieldCheckerAction-based form element has been destroyed!';
        this._errMsgStore = null;             // remove the last store reference (making it eligible for GC)
        this._errMsgStore_unsubscribe = null; // ... ditto
      };
    });
    // ... subscribe to the store, syncing self's _errMsg current value
    this._errMsgStore_unsubscribe = this._errMsgStore.subscribe( (errMsg) => this._errMsg = errMsg );

    // locate our <form> elm, wiring up the FormChecker/FieldChecker containment tree
    //  - CASE-1: for initial DOM setup (the normal case) this is NOT yet available
    //            ... in this case, the wiring occurs from top-to-bottom (later: when FormChecker is established)
    //  - CASE-2: when dynamics are involved (such as sub-sections of the form added) this IS be available
    //            ... in this case, we wire it up bottom-to-top (now: by us)
    // ?? it may be that we can find the <form> but it's action has NOT yet executed
    // ?? L8TR: DO SOMETHING

    // catalog self in the DOM
    // ... so the <form> can do it's wiring (see CASE-1 above)
    // ?? L8TR: DO SOMETHING ?? also need getKey() method -and- some static catalog/accessor
    //? this._key = someNextKey++;
    //? store _key in this._inputElm data-attribute

    // bind a "blur" event to our field, marking it as "touched"
    // <input on:blur={ourFn}>
    // ... NOTE: We really don't need to detect/prevent other on:blur events
    //           - the app logic may need this for other reasons
    //           - technically there is NO way to detect this
    this._inputElm.addEventListener('blur', (e) => {
      // prevent default behavior
      // ... unsure there IS a default for 'blur', but it doesn't hurt
      e.preventDefault();

      // notification that field has been touched (which may trigger validation)
      this.markFieldAsTouched();
    });
    
    // bind an "input" event to our field, monitoring changes (triggering validation as needed)
    // <input on:input={ourFn}>
    // ... this is ONLY done when NO boundValue is supplied
    //     OTHERWISE we detect changes based on the reflexive boundValue itself (see ??)
    // ... NOTE: We really don't need to detect/prevent other on:input events
    //           - the app logic may need this for other reasons
    //           - technically there is NO way to detect this
    if (!this.boundValueSupplied()) {
      this._inputElm.addEventListener('input', (e) => {
        // prevent default behavior
        // ... unsure there IS a default for 'input', but it doesn't hurt
        e.preventDefault();
        
        // provide notification that our field has changed, triggering validation
        // ... in this case, the field change is through inputElm.value
        this.fieldHasChanged();
      });
    }

    // insure our field is in the correct initial state
    // ... including applying initial values
    // ?? we also have a form-level reset()
    //    - it will do form-level stuff -AND- iterate over all field reset()
    //    - most likely the Form constructor call's it's reset() ... although it's fields may NOT be hooked yet
    //    - THIS form-level reset has to be returned out to the client
    this.reset();
  }

  /**
   * Monitor changes to our action parameters.
   *
   * This is invoked by our svelte action's update() life-cycle hook.
   *
   * It is critical in detecting reflexive changes to the clientParams.boundValue!!
   *
   * @param {NamedParams} clientParams - the same clientParams
   * structure passed to our action (i.e. our constructor).
   */
  syncActionParamChanges(clientParams) {
    // NOTE: The primary expected reason clientParams would change is
    //       when a boundValue is in use.  We use this reflexive process
    //       to monitor value changes.  With that said, this routine is coded
    //       in such a way that any clientParams change should be reflected.
    //       BACKGROUND:
    //         - svelte maintains two-way bindings by managing inputElm.value
    //         - unfortunately, due to a limitation in web-standards,
    //           changes to inputElm.value does NOT emit any events
    //           (such as the "input" event we use to monitor changes)
    //         - therefore we are forced to monitor boundValue ourselves
    //           to monitor changes in svelte-bound fields

    // AI: L8TR: provide the same clientParams validation that is done initially in our action
    //     - this will modularize the clientParams validation done in our constructor (above)
    //       ... i.e. the action
    //     - this is most likely overkill
    //       ... don't do it unless we have to
    //       ... because it gets invoked on EACH KEYSTROKE of a svelte-bound field!!

    // re-establish our state from the most current clientParams
    this._validate         = clientParams.validate;
    this._initialValue     = clientParams.initialValue;
    this._boundValue       = clientParams.boundValue; // NOTE: this is the key one of interest
    this._changeBoundValue = clientParams.changeBoundValue;

    // provide notification that our field has changed, triggering validation
    // ... in this case, the field change is through svelte's reactivity of the boundValue
    this.fieldHasChanged();
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
    // we handle BOTH svelte-bound -and- non-bound fields
    return this.boundValueSupplied() ? this._boundValue : this._inputElm.value;
  }

  /**
   * A notification that our field value has changed.
   * 
   * This handles BOTH svelte-bound -and- non-bound fields (by virtue
   * of the two distinct places it is invoked).
   */
  fieldHasChanged() {
    // NOTE: Because the field value is no longer cached, there is
    //       very little for us to do.  Only validation.

    // request validation at the form level
    // ... NOTE: because field validation can involve inner-dependent fields,
    //           the entire form is validated (i.e. all fields, per the right conditions)
    this.getParentForm().validate();
  }

  /**
   * Initialize self's field value (in the DOM) to the client supplied
   * `initialValue`, if any (no-op otherwise).
   * 
   * This handles BOTH svelte-bound -and- non-bound fields.
   */
  initializeDomFieldValue() {
    if (this.initialValueSupplied()) {
      if (this.boundValueSupplied()) {
        this._changeBoundValue(this._initialValue);
        // ?? unsure if we want to trigger change here (with it's validation) BUT I think this boundValue change WILL do this regardless
      }
      else {
        inputElm.value = this._initialValue;
        // ?? unsure if we want to trigger change here (with it's validation) BUT if we do it must be done explicitly here (?? whatever we decide SHOULD be consistent with bound case - above)
      }
    }
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
  registerParentForm(parentForm) {
    // validate parameters
    const check = verify.prefix(`FieldChecker[{name: '${this.getFieldName()}'}].registerParentForm(): parameter violation: `);
    // ... parentForm
    check(parentForm,                      'parentForm is required');
    check(parentForm.registerFieldChecker, 'parentForm must be a FormChecker instance');
    // ... above uses duck type check to avoid circular dependency import needed for `instanceof FormChecker` semantics
    //     ?? does FormChecker even need to import FieldChecker now (after refactor)?
    // ... should NOT already have a registered parentForm
    check(this._parentForm===null || this._parentForm===parentForm, "self's parentForm is ALREADY registered :-(");

    // retain our parentForm
    this._parentForm = parentForm;
  }

  /**
   * Remove self's parent form.
   *
   * The ONLY acceptable invoker of this method should be: FormChecker.removeFieldChecker(self).
   */
  removeParentForm() {
    // validate state
    const check = verify.prefix(`FieldChecker[{name: '${this.getFieldName()}'}].removeParentForm(): `);
    // ... should HAVE a registered parentForm
    check(this._parentForm!==null, "NO parentForm is registered to self ... can't remove it :-(");

    // remove our parentForm
    this._parentForm = null;
  }

  /**
   * Convenience method interpreting whether an `initialValue` has been
   * supplied to self.
   *
   * @returns {boolean} true: `initialValue` has been supplied, false: otherwise
   */
  initialValueSupplied() {
    return this._initialValue===undefined ? false : true;
  }

  /**
   * Convenience method interpreting whether an `boundValue` has been
   * supplied to self.
   *
   * @returns {boolean} true: `boundValue` has been supplied, false: otherwise
   */
  boundValueSupplied() {
    return this._boundValue===undefined ? false : true;
  }

  /**
   * Reset self field-related aspects back to it's original state.
   *
   * This is useful when a form is re-used without deleting it's DOM
   * representation (example: when used in a form-based dialog).
   */
  reset() {
    // initialize self's field value (in the DOM) to the client
    // supplied `initialValue`, if any (no-op otherwise)
    this.initializeDomFieldValue();

    // reset our error state
    this.clearErrMsg();
    this._cachedIsValid = 'UNKNOWN';

    // mark self as NOT touched
    this._touched = false;
  }

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
      // ... NOTE: checkValidity() -AND- validationMessage are part of this standard web API
      let errMsg = this._inputElm.checkValidity() === false ? this._inputElm.validationMessage : '';

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
   * Destroy self, invoked by our svelte action's destroy() life-cycle
   * hook.
   *
   * The primary aspect accomplished here is to remove self from our
   * parent FormChecker.  This is critical when maintaining the
   * appropriate field validation dynamics that match a dynamic DOM
   * representation.
   */
  destroy() {
    // remove self from our parent FormChecker
    // ?? IMPLEMENT THIS (in FormChecker)
    //? this.getParentForm().removeFieldChecker(this);
    //? ... which in turn, should invoke: fieldChecker.removeParentForm()

    // unsubscribe to our error message store (allowing it to clear it's state)
    this._errMsgStore_unsubscribe()

    // AI: clear our event listeners
    //  1. to accomplish this we need to make our event handlerFunctions non-anonymous
    //  2. this cleanup is prob an overkill - the inputElm has already been removed
    //  >> JUST PUNT (unless it is a problem)
    // inputElm.removeEventListener('blur',  needFunc);
    // inputElm.removeEventListener('input', needFunc);

    // AI: clear additional functional state
    // ... prob an overkill
    // >>> JUST PUNT (unless it is a problem)
  }

  /**
   * Provide symbolic representation of self.
   * 
   * @returns {string} a human consumable representation of self
   */
  toString() {
    return `FieldChecker: '${this.getFieldName()}'`;
  }
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
