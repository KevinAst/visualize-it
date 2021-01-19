// ?? ?#: further refinement for Phase II
// ?? ?%: DOM-BASED-CLEANUP: once we restructure to be DOM-based (where FieldChecker is independent of FormChecker) this will be cleaned up!

import {writable}        from 'svelte/store';
import verify            from '../../verify.js';
import {isFunction,
        isPlainObject}   from '../../typeCheck';
import {get,
        register,
        unregister}      from './snfCatalog';

const errStylesDEFAULT = {
  border:          '2px solid #900', /* solid red border */
  backgroundColor: '#FDD',           /* pink background  */
}

/**
 * A FormChecker object orchestrates validation of interactive html forms.
 *
 * **NOTE**: FormChecker object instances are a thin layer on top of
 *           the formCheckerAction.  As a result, you will see public
 *           facing items (such as Errors) reflect
 *           "formCheckerAction" nomenclature.
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
export default class FormChecker {

  /**
   * Create a FormChecker.
   *
   * **NOTE**: This constructor has the SAME signature of formCheckerAction.
   *
   * @param {DOMElm} formNode - the `<form>` element we are managing
   * (supplied by svelte).
   *
   * **Please Note**: Subsequent to the formNode parameter (supplied by svelte),
   *                  named parameters are in use (supplied by client).
   *
   * @param {function} submit - an app-specific process
   * function, triggered by submit after all fields pass validation.
   *
   *   API:
   *    + submit(event, fieldValues): void
   *
   * @param {object} [controller] - an optional object that, when
   * supplied, will be populated with the SNF public API (a pseudo
   * pass-by-reference).
   *
   *   API:
   *   ```
   *   {
   *     reset() ... Reset the form back to it's original state.
   *                 Useful when a form is re-used without deleting it's DOM
   *                 representation (say when used in a form-based dialog).
   *   }
   *   ```
   *
   * @param {object} [errStyles] - an optional object containing the
   * in-line styles to apply to input elements that are in error.
   *
   *   - use an object with in-line styling pairs: camelCaseKey/value
   *   - or `null` to disable
   *
   *   DEFAULT:
   *   ```
   *   {
   *     border:          '2px solid #900', ... solid red border
   *     backgroundColor: '#FDD',           ... pink background
   *   }
   *   ```
   */
  constructor(formNode, clientParams={}) {

    //***
    //*** validate supplied parameters
    //***

    const check = verify.prefix('formCheckerAction parameter violation: ');

    // formNode:
    check(formNode,                     'a DOM elm was expected (by svelte) but is missing ... something is wrong');
    check(formNode.nodeName === 'FORM', `this svelte action should be used on a <form> element, NOT a <${formNode.nodeName.toLowerCase()}>`);

    // clientParams:
    check(isPlainObject(clientParams), "client supplied parameters should be named parameters (ex: {submit})");
    // ... descturcture our individual clientParams (i.e. named parameters)
    const {submit,
           controller,
           errStyles=errStylesDEFAULT,
           ...unknownNamedArgs} = clientParams;

    // retain all parameters in self
    // ... even though we have not yet completed validation (doesn't hurt)
    this._formNode   = formNode;
    this._submit     = submit;
    this._controller = controller;
    this._errStyles  = errStyles;

    // submit:
    check(submit,             'submit is required');
    check(isFunction(submit), 'submit must be a function');

    // controller (optional):
    if (controller) {
      check(isPlainObject(controller), 'controller (when supplied) must be a plain object, which will be populated with the SNF public API (a pseudo pass-by-reference)');
    }

    // errStyles (optional):
    check(errStyles === null || 
          isPlainObject(errStyles), 'errStyles must be a plain object with camelCaseKey/value in-line styling pairs -OR- null to disable');

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

    // retain additional state in self
    this._fieldCheckers = [];
    this._hasSubmitBeenAttempted = false; // has user attempted a submit?

    // setup our form-based error state (a reactive svelte store)
    // ... the current value
    this._isFormValid = true;
    // ... the reflexive store
    this._isFormValidStore = writable(true, () => { // clean-up function
      // console.log(`XX formCheckerAction isFormValidStore registered it's FIRST subscriber!`);
      return () => {
        // clear our action's isFormValidStore state on LAST subscription
        // ... we can do this because self's FormChecker is a subscriber
        //     SO if the subscription goes to zero, our object HAS BEEN DESTROYED!
        // console.log(`XX formCheckerAction isFormValidStore un-registered it's LAST subscriber ... clearing our action's isFormValidStore state!`);
        this._isFormValid      = 'OBSOLETE - the formCheckerAction-based form element has been destroyed!';
        this._isFormValidStore = null;             // remove the last store reference (making it eligible for GC)
        this._isFormValidStore_unsubscribe = null; // ... ditto
      };
    });
    // ... subscribe to the store, syncing self's _isFormValid current value
    this._isFormValidStore_unsubscribe = this._isFormValidStore.subscribe( (isFormValid) => this._isFormValid = isFormValid );

    // register self in our snfCatalog
    // ... retaining the key in self
    // ... and registering the key in our DOM (using "HTML5 Custom Data Attributes")
    this._key = register('FormChecker', this); // ... ex: 'FormChecker-3010'
    this._formNode.dataset.snfKey = this._key; // ... ex: <input data-snf-key="FormChecker-3010" ...>

    // wire up all FieldChecker children, accessed via the DOM hierarchy
    // ... because our formCheckerAction executes last (as it is the top of the hierarchy)
    //     we must wire up our FieldChecker children (on this DOM's initial construction)
    const fieldNodes = [...formNode.elements]; // ... all DOM fields within the form (<input>, <select>, <textarea>, etc.)
    fieldNodes.forEach((fieldNode) => {
      // ... if snfKey has NOT been set, 
      //     it means the <input> does NOT have a fieldCheckerAction (occurs when no validation is required for this field)
      //     and fieldChecker will be undefined
      const fieldChecker = get(fieldNode.dataset.snfKey);
      if (fieldChecker) {
        this.registerFieldChecker(fieldChecker);
        // console.log(`XX formCheckerAction wiring up field: ${fieldChecker}`);
      }
    });

    // apply the novalidate attribute to our <form>
    // ... this disables the standard error presentation (allowing our presentation to take affect)
    // ... while leaving the Constraint Validation API in place (so we can tap into that)
    // <form novalidate ...>
    // ... we perform all field validation :-)
    check(!formNode.hasAttribute('novalidate'), 'the <form> element should NOT manage the "novalidate" attribute ... this is the job of formCheckerAction');
    formNode.setAttribute('novalidate', true);

    // register the on:submit event to our <form>
    // <form on:submit={ourFn}>
    // ... NOTE: there is NO WAY to determine if an event has already been registered
    formNode.addEventListener('submit', (e) => {
      // prevent default behavior - we do NOT want to submit anything (over the web)
      e.preventDefault();

      // request a submit
      this.submitRequested(e);
    });

    // bind necessary methods to self's object, allowing them to be used as isolated functions
    this.reset = this.reset.bind(this);

    // define the SNF public controller API, optionally communicated to our client
    const publicController = {
      reset: this.reset,
    }

    // when supplied, populate the client controller with our SNF public API (a pseudo pass-by-reference)
    if (controller) {
      Object.entries(publicController).forEach( ([key, val]) => controller[key] = val );
    }

    // insure our form (and it's fields) are in the correct initial state
    // ... including applying initial field values
    this.reset();
  }

  /**
   * A submit request will validate the form, setting our form/field
   * error state, and issue a client-specific submit when the form is
   * clean.
   * 
   * @returns {DOMEvent} the submit form event.
   */
  submitRequested(e) {

    // mark form submit attempted
    // ... this opens the flood gates that forces ALL field validation
    this._hasSubmitBeenAttempted = true;

    // validate ALL fields in this form
    this.validate();

    // conditionally invoke our app logic submit process (when all our fields are valid)
    // ... also set our form status, based on the validity of our fields
    if (this.areFieldsValid()) { // ... our fields are valid
      this.setFormValid();

      // invoke our app logic submit process
      const fieldValues = this.getFieldValues();
      // console.log(`XX submit() invoked: `, {event: e, fieldValues});
      this._submit(e, fieldValues);
    }
    else { // ... our fields are invalid
      this.setFormInvalid();
      // console.log(`XX submit() NOT invoked: our form is invalid`);
    }
  }

  /**
   * Register the supplied fieldChecker to self.
   *
   * @param {FieldChecker} fieldChecker - the fieldChecker object to register.
   */
  registerFieldChecker(fieldChecker) {
    // validate parameters
    const check = verify.prefix(`FormChecker.registerFieldChecker(): parameter violation: `);
    // ... fieldChecker
    check(fieldChecker,                    'fieldChecker is required');
    check(fieldChecker.registerParentForm, 'fieldChecker must be a FieldChecker instance');
    // ... above uses duck type check to avoid circular dependency import needed for `instanceof FieldChecker` semantics


    // supplied fieldChecker's name must be unique
    const nonUniqueObj = this._fieldCheckers.find( (f) => f.getFieldName() === fieldChecker.getFieldName() );
    check(!nonUniqueObj, `supplied fieldChecker's name ('${fieldChecker.getFieldName()}') is NOT unique ... it already exists`);

    // register to self
    this._fieldCheckers.push(fieldChecker);

    // maintain the bi-directional relationship
    fieldChecker.registerParentForm(this);
  }

  /**
   * Remove the supplied fieldChecker from self.
   *
   * @param {FieldChecker} fieldChecker - the fieldChecker object to remove.
   */
  removeFieldChecker(fieldChecker) {
    // validate parameters
    const check = verify.prefix(`FormChecker.removeFieldChecker(): parameter violation: `);
    // ... fieldChecker
    check(fieldChecker,                         'fieldChecker is required');
    check(fieldChecker.registerParentForm, 'fieldChecker must be a FieldChecker instance');
    // ... above uses duck type check to avoid circular dependency import needed for `instanceof FieldChecker` semantics

    // remove from self
    const indx = this._fieldCheckers.findIndex( (fc) => fc === fieldChecker);
    if (indx > -1) {
      this._fieldCheckers.splice(indx, 1);
    }

    // maintain the bi-directional relationship
    fieldChecker.removeParentForm();
  }

  /**
   * Reset self back to it's original state.
   *
   * This is useful when a form is re-used without deleting it's DOM
   * representation (example: when used in form-based dialog).
   */
  reset() {
    // reset our error state
    this.setFormValid();

    // mark form submit as NOT attempted
    this._hasSubmitBeenAttempted = false;

    // propagate request to each field
    this._fieldCheckers.forEach( (fieldChecker) => fieldChecker.reset() );
  }

  /**
   * Return self's fieldChecker of the supplied name (undefined for none)
   *
   * @param {string} name - the name of the fieldChecker to search for.
   *
   * @returns {FieldChecker} the fieldChecker matching the supplied name (undefined for none).
   */
  getFieldCheckerByName(name) {
    return this._fieldCheckers.find( (fieldChecker) => fieldChecker.getFieldName() === name );
  }

  /**
   * Return the current values of all our fields.
   *
   * @returns {FieldValueMap} a key/value map of all our fields: {fieldName: fieldValue, ...}
   */
  getFieldValues() {
    // build content from each field
    return this._fieldCheckers.reduce( (accum, fieldChecker) => {
      accum[fieldChecker.getFieldName()] = fieldChecker.getFieldValue();
      return accum;
    }, {});
  }

  /**
   * Validate all fields of the form (as needed - in the right circumstances),
   * resulting in all field-based errMsg state being updated!
   */
  validate() {
    // clear our single form-based status (for aesthetics)
    // ... this is reset in our submitRequested() process
    this.setFormValid();

    // validate all fields of self
    // NOTE: field validation is conditional (in the right circumstances)
    this._fieldCheckers.forEach( (fieldChecker) => fieldChecker.validate() );

    // NOTE: For form-based validation, we do NOT directly sync our form-based isFormValid state!
    //       This is accomplished in the submitRequested() process (when field errors are detected).
  }

  /**
   * Return self's form-based error state reactive store.
   * 
   * @returns {StoreContainingBoolean} self's form-based error state reactive store
   */
  getIsFormValidStore() {
    return this._isFormValidStore;
  }

  /**
   * Return self's form-based error state.
   * 
   * @returns {boolean} true: form is valid, false: form is invalid
   */
  isFormValid() {
    // NOTE: this field is synced with our corresponding store (via a subscription)
    return this._isFormValid;
  }

  /**
   * Mark self's form-based error status as INVALID.
   */
  setFormInvalid() {
    // NOTE: This is accomplished through our reactive store, 
    //       which in turn syncs our current value (_isFormValid)
    this._isFormValidStore.set(false);
  }

  /**
   * Mark self's form-based error status as VALID.
   */
  setFormValid() {
    // NOTE: This is accomplished through our reactive store, 
    //       which in turn syncs our current value (_isFormValid)
    this._isFormValidStore.set(true);
  }

  /**
   * Return indicator as to whether our fields are all valid.
   * 
   * @returns {boolean} true: fields are valid, false: one or more fields are invalid
   */
  areFieldsValid() {
    // NOTE: Our overall form status (i.e. isFormValid()), is triggered from our submitRequested() process.
    return this._fieldCheckers.reduce( (accum, fieldChecker) => accum && fieldChecker.isValid(), true);
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
   * Destroy self, invoked by our svelte action's destroy() life-cycle
   * hook.
   *
   * The primary aspect accomplished here is general cleanup, for GC eligibility.
   */
  destroy() {
    // remove all remaining fieldChecker objects from self's FormChecker
    // ... most likely this will no-op
    //     BECAUSE: our fieldCheckerActions have been destroyed via the DOM
    //     HOWEVER: doesn't hurt (for good measure)
    // ... NOTE: we use while loop (NOT .forEach()) because we are removing entries through mutation
    while (this._fieldCheckers.length) {
      this.removeFieldChecker(this._fieldCheckers[0]);
    }

    // unsubscribe to our form-based error state (allowing it to clear it's state)
    this._isFormValidStore_unsubscribe()

    // unregister self in our snfCatalog
    // ... we could also remove our DOM data attribute, but the DOM is gone, so it is a mute point)
    //     e.g. this._formNode.removeAttribute('data-snf-key');
    unregister(this._key);

    // AI: clear our event listeners
    //  1. to accomplish this we need to make our event handlerFunctions non-anonymous
    //  2. this cleanup is prob an overkill - the formNode has already been removed
    //  >> JUST PUNT (unless it is a problem)
    // formNode.removeEventListener('submit', needFunc);

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
    return this._fieldCheckers.reduce((accum, fieldChecker) => accum + '\n  - ' + fieldChecker,
                                      `FormChecker: `);
  }
}
