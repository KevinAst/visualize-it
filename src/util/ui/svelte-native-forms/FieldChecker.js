import {writable}        from 'svelte/store';
import verify            from '../../verify';
import {isString,
        isPlainObject,
        isFunction}      from '../../typeCheck';
import {get,
        register,
        unregister}      from './catalog';

/**
 * A FieldChecker object orchestrates validation of an individual
 * field (an interactive html form element).
 *
 * **NOTE**: FieldChecker object instances are a thin layer on top of
 *           the fieldCheckerAction.  As a result, you will see public
 *           facing items (such as Errors) reflect
 *           "fieldCheckerAction" nomenclature.
 *
 * **NOTE**: Regarding one specific variable name, WE AVOID the usage of: formElm
 *           - Because it is ambiguous as to whether we are referring to the "form" or "field"
 *             ... due to the unfortunate pseudo-standard term "interactive form element" (referring to fields)
 *           - RATHER we use:
 *             * formNode:  refers to the `<form>` element
 *             * fieldNode: refers to the "field(s)" of a `<form>`
 *                          ... what is typically called "interactive form element(s)"
 *                          ... `<input>`, `<select>`, `<textarea>`, etc.
 */
export default class FieldChecker {

  /**
   * Create a FieldChecker.
   *
   * **NOTE**: This constructor has the SAME signature of fieldCheckerAction.
   *
   * @param {DOMElm} fieldNode - the "field" element we are managing
   * (supplied by svelte).  This is what it typically called an
   * "interactive form element" ... `<input>`, `<select>`,
   * `<textarea>`, etc.
   *
   * **Please Note**: Subsequent to the fieldNode parameter (supplied by svelte),
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
   * bound to this fieldNode (required when svelte's bind:value is in
   * affect).  This is needed due to a web limitation where updates to
   * fieldNode.value (how svelte maintains the two-way binding) does NOT
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
  constructor(fieldNode, clientParams={}) {

    //***
    //*** validate supplied parameters
    //***

    const check = verify.prefix('fieldCheckerAction parameter violation: ');

    // fieldNode:
    check(fieldNode, 'a DOM elm was expected (by svelte) but is missing ... something is wrong');
    check(['INPUT', 'SELECT', 'TEXTAREA'].indexOf(fieldNode.nodeName) >= -1,
          `this action should be used on an interactive form element, NOT a <${fieldNode.nodeName.toLowerCase()}>`);
    check(fieldNode.form, "this action's interactive form element MUST BE part of a <form>");

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
    this._fieldNode        = fieldNode;
    this._validate         = validate;
    this._initialValue     = initialValue;
    this._boundValue       = boundValue;
    this._changeBoundValue = changeBoundValue;

    // validate:
    if (validate) {
      check(isFunction(validate),  'validate (when supplied) must be a function');
    }

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

    // extract our fieldName from elm.name or elm.id (name takes precedence)
    this._fieldName = fieldNode.getAttribute('name') || fieldNode.getAttribute('id');
    check(this._fieldName, 'the actions form element MUST have a name -or- id attribute ... defining our actions fieldName (name takes precedence)');

    // retain additional state in self
    this._parentForm    = null;      // defined later via: registerParentForm()
    this._touched       = false;
    this._cachedIsValid = 'UNKNOWN'; // a cached boolean isValid, with a "3rd" unknown state

    // setup our field-based error message (a reactive svelte store)
    // ... the current value
    this._errMsg = '';
    // ... the reflexive store
    this._errMsgStore = writable('', () => { // clean-up function ?? NEW: TEST THIS OUT
      // console.log(`XX fieldCheckerAction[field: '${this.getFieldName()}']: registered errMsgStore's FIRST subscriber!`);
      return () => {
        // clear our action's errMsgStore state on LAST subscription
        // ... we can do this because self's FieldChecker is a subscriber
        //     SO if the subscription goes to zero, our object HAS BEEN DESTROYED!
        // console.log(`XX fieldCheckerAction[field: '${this.getFieldName()}']: un-register errMsgStore - it has NO MORE subscribers!`);
        this._errMsg      = 'OBSOLETE - the fieldCheckerAction-based form element has been destroyed!';
        this._errMsgStore = null;             // remove the last store reference (making it eligible for GC)
        this._errMsgStore_unsubscribe = null; // ... ditto
      };
    });
    // ... subscribe to the store, syncing self's _errMsg current value
    this._errMsgStore_unsubscribe = this._errMsgStore.subscribe( (errMsg) => this._errMsg = errMsg );

    // register self in our catalog
    // ... retaining the key in self
    // ... and registering the key in our DOM (using "HTML5 Custom Data Attributes")
    this._key = register('FieldChecker', this); // ... ex: 'FieldChecker-3005'
    this._fieldNode.dataset.snfKey = this._key; // ... ex: <input data-snf-key="FieldChecker-3005" ...>

    // optionally wire up our FormChecker parent, when our DOM is pre-established
    // - when the form's snfKey/formChecker IS defined:
    //   * then self's fieldNode has been dynamically introduced to this existing form
    //     and we wire it up now (dynamically)
    // - when the form's snfKey/formChecker IS NOT defined:
    //   * it means the <form use:formCheckerAction> has not been executed yet
    //     (or the action is missing)
    //   * in this case we rely on the formCheckerAction to wire us up (once it executes)
    //     ... if the formCheckerAction is missing, we will catch that in our getParentForm() check
    const formChecker = get(fieldNode.form.dataset.snfKey);
    if (formChecker) {
      formChecker.registerFieldChecker(this);
      // console.log(`XX fieldCheckerAction field: '${this.getFieldName()}' dynamically wired up our form: ${formChecker}`);
    }
    // else {
    //   console.log(`XX fieldCheckerAction field: '${this.getFieldName()}' waiting for our form to execute the formCheckerAction to wire us up`);
    // }

    // bind a "blur" event to our field, marking it as "touched"
    // <input on:blur={ourFn}>
    // ... NOTE: We really don't need to detect/prevent other on:blur events
    //           - the app logic may need this for other reasons
    //           - technically there is NO way to detect this
    this._fieldNode.addEventListener('blur', (e) => {
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
      this._fieldNode.addEventListener('input', (e) => {
        // prevent default behavior
        // ... unsure there IS a default for 'input', but it doesn't hurt
        e.preventDefault();
        
        // provide notification that our field has changed, triggering validation
        // ... in this case, the field change is through fieldNode.value
        this.fieldHasChanged();
      });
    }

    // insure our field is in the correct initial state
    // ... including applying initial values
    // ... NOTE: Our form-level reset() will invoke all fields reset()
    //           ... invoked both in it's construction and our client reset() request
    //           However, when dynamics are involved (where form elements are added/removed)
    //           THIS reset() is necessary.
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
    //         - svelte maintains two-way bindings by managing fieldNode.value
    //         - unfortunately, due to a limitation in web-standards,
    //           changes to fieldNode.value does NOT emit any events
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
    return this.boundValueSupplied() ? this._boundValue : this._fieldNode.value;
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
        fieldNode.value = this._initialValue;
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
    // verify we have a parentForm
    // ... this is a central spot where we can check to insure our structure has been setup correctly
    //     - due to the dynamics of our wiring (gleaning our hierarchy from the DOM hierarchy
    //     - driven by our svelte actions
    verify(this._parentForm, `*** ERROR *** Invalid FormChecker structure (FieldChecker has NO parent FormChecker) ... did you forget to apply the formChecker action on your <form>?`);

    // fulfill request
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
    // ... should NOT already have a registered parentForm
    check(this._parentForm===null || this._parentForm===parentForm, "self's parentForm is ALREADY registered :-(");

    // retain our parentForm
    this._parentForm = parentForm;
  }

  /**
   * Remove self's parent form.
   *
   * NOTE: In order to maintain our bi-directional relationship, the ONLY
   *       acceptable invoker of this method should be: 
   *         FormChecker.removeFieldChecker(fieldChecker).
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
      let errMsg = this._fieldNode.checkValidity() === false ? this._fieldNode.validationMessage : '';

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
    // ... condition (below) is due to "initial setup" race condition
    //     NO-OP styling in this case
    //     NOTE: should be correctly "re-executed" from a our formChecker control
    if (this._parentForm) {
      this.styleFieldErr();
    }
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
        // EX: this._fieldNode.style.removeProperty('background-color')
        removeProp(this._fieldNode.style, camel2dashes(propName))
      });
      // AI: CONSIDER retaining prior client-defined in-styles, to revert back to
      //     ... this would have to be done in constructor (once we know the properties we are dealing with - since it is parameterized)
      //         EX: this._clientInLineStyles: {...}
    }
    else { // ... apply error styles
      // console.log(`XX styling form element '${this.getFieldName()}' AS invalid`);
      Object.entries(errStyles).forEach( ([propName, propValue]) => {
        this._fieldNode.style[propName] = propValue
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
    // ... by controlling from parentForm, our bi-directional relationship is maintained
    // ... NOTE: condition (below) ALLOWS demo to continue for error conditions that are caught at run-time
    //           - we NO-OP the cleanup process (in this case)
    if (this._parentForm) {
      this.getParentForm().removeFieldChecker(this);
    }

    // unsubscribe to our error message store (allowing it to clear it's state)
    this._errMsgStore_unsubscribe()

    // unregister self in our catalog
    // ... we could also remove our DOM data attribute, but the DOM is gone, so it is a mute point)
    //     e.g. this._fieldNode.removeAttribute('data-snf-key');
    unregister(this._key);

    // AI: clear our event listeners
    //  1. to accomplish this we need to make our event handlerFunctions non-anonymous
    //  2. this cleanup is prob an overkill - the fieldNode has already been removed
    //  >> JUST PUNT (unless it is a problem)
    // fieldNode.removeEventListener('blur',  needFunc);
    // fieldNode.removeEventListener('input', needFunc);

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
