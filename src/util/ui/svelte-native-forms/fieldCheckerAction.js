import verify            from '../../verify';
import {isPlainObject,
        isFunction}      from '../../typeCheck';

/**
 * The svelte action (for interactive html form input elements), that
 * establishes the necessary DOM binding for our validation.
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
 *     + changeBoundValue(initialValue): void (updating client boundValue)
 */
export default function fieldCheckerAction(inputElm, clientParams={}) {

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
  let {validate,
       initialValue,
       boundValue,
       changeBoundValue,
       ...unknownNamedArgs}   = clientParams;

  // ... convenience xyzSupplied() utils
  const initialValueSupplied = () => initialValue===undefined ? false : true;
  const boundValueSupplied   = () => boundValue===undefined   ? false : true;

  // validate:
  check(validate && isFunction(validate),  'validate (when supplied) must be a function');

  // initialValue: NO VALIDATION NEEDED (any value is acceptable)

  // boundValue: NO VALIDATION NEEDED (any value is acceptable)

  // changeBoundValue:
  if (initialValueSupplied() && boundValueSupplied()) {
    check(changeBoundValue,             'changeBoundValue is required when initialValue and boundValue are supplied');
    check(isFunction(changeBoundValue), 'changeBoundValue must be a function');
  }
  else {
    check(!changeBoundValue, 'changeBoundValue is ONLY NEEDED when BOTH initialValue and boundValue are supplied');
  }

  // unrecognized positional parameter
  // NOTE: when defaulting entire struct, arguments.length is 0
  // ... prob an overkill, since svelte is in control of this
  check(arguments.length <= 2, `unrecognized positional parameters (only named parameters may be specified) ... ${arguments.length} positional parameters were found`);

  // unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownNamedArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);


  //***
  //*** define additional functional state
  //***

  // fieldName: gleaned from elm.name (takes precedence) -or- elm.id
  const fieldName = inputElm.getAttribute('name') || inputElm.getAttribute('id');
  check(fieldName, 'to derive the fieldName, the actions interactive form element MUST specify either a name or id attribute (name takes precedence)');

  // locate our <form> elm, wiring up the FormChecker/FieldChecker containment tree
  //  - CASE-1: for initial DOM setup (the normal case) this is NOT yet available
  //            ... in this case, the wiring occurs from top-to-bottom (later: when FormChecker is established)
  //  - CASE-2: when dynamics are involved (such as sub-sections of the form added) this IS be available
  //            ... in this case, we wire it up bottom-to-top (now: by us)
  // ?? it may be that we can find the <form> but it's action has NOT yet executed
  // ?? L8TR: DO SOMETHING

  // instantiate our FieldChecker controller instance
  const fieldChecker = new FieldChecker({fieldName, validate, interpretDomConstraintValidation, getDomFieldValue, initializeDomFieldValue});

  // catalog our controller in our DOM
  // ... so the <form> can wire it up (see CASE-1 above)
  //? const fieldCheckerKey = fieldChecker.getKey(); // ?? L8TR: new method ?? prob don't need var
  // ?? L8TR: STORE fieldCheckerKey in data-attribute


  //***
  //*** helper functions (with closure access to our functional state)
  //***

  // get the current DOM value of this field
  // ... handling BOTH svelte-bound -and- non-bound fields
  //     + getDomFieldValue(): value
  function getDomFieldValue() {
    return boundValueSupplied() ? boundValue : inputElm.value;
  }

  // initialize the field value's DOM representation
  // ... handling BOTH svelte-bound -and- non-bound fields
  //     + initializeDomFieldValue(): void
  function initializeDomFieldValue() {
    // ... ONLY when initialValue is supplied (no-op otherwise)
    if (initialValueSupplied()) {
      if (boundValueSupplied()) {
        changeBoundValue(initialValue);
        // ?? unsure if we want to trigger change here (with it's validation) BUT I think this boundValue change WILL do this regardless
      }
      else {
        inputElm.value = initialValue;
        // ?? unsure if we want to trigger change here (with it's validation) BUT if we do it must be done explicitly here (?? whatever we decide SHOULD be consistent with bound case - above)
      }
    }
  }

  // interpret the standard "HTML Form Element Constraint Validation"
  // ... ex: <input type="text" required minlength="5">
  function interpretDomConstraintValidation() {
    // checkValidity() -AND- validationMessage are part of this standard web API
    return inputElm.checkValidity() === false ? inputElm.validationMessage : '';
  }

  // monitor changes to our action parameter
  function update(clientParams) {

    // NOTE: The primary expected reason clientParams would change is
    //       when a boundValue is in use.  We use this reflexive process
    //       to monitor value changes.  With that said, this routine is coded
    //       in such a way that any clientParams change should be reflected.
    //       BACKGROUND: - svelte maintains two-way bindings by managing inputElm.value
    //                   - unfortunately, due to a limitation in web-standards,
    //                     changes to inputElm.value does NOT emit any events
    //                     (such as the "input" event we use to monitor changes)
    //                   - therefore we are forced to monitor boundValue ourselves
    //                     to monitor changes in svelte-bound fields

    // provide the same clientParams validation that is done initially in our action
    // AI: modularize the clientParams validation done in our action
    //     ... this may be an overkill (because it gets invoked on EACH KEYSTROKE of a svelte-bound field)

    // re-establish our outer state from the most current clientParams
    validate         = clientParams.validate;
    initialValue     = clientParams.initialValue;
    boundValue       = clientParams.boundValue; // NOTE: this is the key one of interest
    changeBoundValue = clientParams.changeBoundValue;

    // provide notification that our field has changed, triggering validation
    // ... the field change is through svelte's reactivity of the boundValue
    fieldChecker.fieldHasChanged(); // ??$$ implement method
    // ?? method does the following:
    //    - because of field value is no longe cached it does VERY LITTLE
    //    - basically request validation at the form level
    //      ... NOTE: because field validation can involve inner-dependent fields,
    //                the entire form is validated (i.e. all fields - per the right conditions)
  }

  // the inputElm has been removed from the DOM
	function destroy() {
    // clear our event listeners
    //  1. to accomplish this we need to make the handlerFunction (above) non-anonymous
    //  2. this cleanup is prob an overkill - the inputElm has already been removed
    //  >> JUST PUNT (unless it is a problem)
    // inputElm.removeEventListener('blur',  needFunc);
    // inputElm.removeEventListener('input', needFunc);

    // clear up our FieldChecker controller instance
    // ... this will remove itself from our parent FormChecker
    fieldChecker.destroy(); // ??$$ implement method (unhook itself from it's parent, and anything else?)

    // clear our functional state
    // ... prob an overkill
    // ... some of this is "const"
    // >>> JUST PUNT (unless it is a problem)
    // validate         = null;
    // initialValue     = null;
    // boundValue       = null;
    // changeBoundValue = null;
    // 
    // fieldName        = null;
    // fieldChecker     = null;
    // fieldCheckerKey  = null;
  }


  //***
  //*** register needed inputElm event listeners
  //***

  // bind a "blur" event to the field, marking it as "touched"
  // <input on:blur={ourFn}>
  // ... NOTE: We really don't need to detect/prevent other on:blur events
  //           - the app logic may need this for other reasons
  //           - technically there is NO way to detect this
  inputElm.addEventListener('blur', (e) => {
    // prevent default behavior
    // ... unsure there IS a default for 'blur', but it doesn't hurt
    e.preventDefault();

    // notification that field has been touched (which may trigger validation)
    fieldChecker.markFieldAsTouched();
  });
  
  // when no boundValue is supplied, we monitor field changes through the element's "input" event (triggering validation as needed)
  // <input on:input={ourFn}>
  // ... NOTE: We really don't need to detect/prevent other on:input events
  //           - the app logic may need this for other reasons
  //           - technically there is NO way to detect this
  if (!boundValueSupplied()) {
    inputElm.addEventListener('input', (e) => {
      // prevent default behavior
      // ... unsure there IS a default for 'input', but it doesn't hurt
      e.preventDefault();
      
      // notification that field has changed (which in turn triggers validation)
      fieldChecker.fieldHasChanged();
    });
  }



  //***
  //*** thats all folks
  //***

  // our return registers svelte action life cycle hooks
  return {update, destroy};
}
