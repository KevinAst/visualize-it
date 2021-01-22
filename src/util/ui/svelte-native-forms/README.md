# svelte-native-forms

*... minimalist form validation with powerful results*

<!---  FOLLOWING PARAGRAPH 
       REFINED FROM: Constraint Validation: Native Client Side Validation for Web Forms
                     ... https://www.html5rocks.com/en/tutorials/forms/constraintvalidation/
       Validating forms has notoriously been a painful development
       experience. Implementing client side validation in a user friendly,
       developer friendly, and accessible way is hard. Before HTML5 there was
       no means of implementing validation natively; therefore, developers
       have resorted to a variety of JavaScript based solutions.
 ---> 

Validating forms has notoriously been a painful development
experience.  Implementing client side validation _in a user friendly
way **is a tedious and arduous process**_
&bull; you want to validate fields only at the appropriate time _(when the
user has had the chance to enter the data)_
&bull; you want to present validation errors in a pleasing way
&bull; you may need to apply custom validation _(specific to your
application domain)_
&bull; etc.

<!--- AI: should following sentence reference HTML5's Constraint Validation https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation ---> 

Even with the introduction of [HTML5's Form Validation], it is still
overly complex, and doesn't address many common scenarios _(mentioned
above)_.  Without the proper approach, form validation can be one of
the most difficult tasks in web development.

<!--- *** Section ************************************************************************* ---> 
**Overview:**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**svelte-native-forms** _(<mark>aka **SNF**</mark>)_ is a [svelte] utility that
facilitates field validation in your native html forms.

The term _**native**_ refers to the utilization of the native HTML
`<form>` tag and the corresponding form elements (`<input>`,
`<select>`, `<textarea>`, etc.).  In other words, **SNF** does NOT
introduce components for these abstractions, rather you use the native
html representations.

Here are some **key points** to understand:

- **SNF** is based on **svelte actions**.  By applying a simple action
  to your form elements, the basics of the form validation control is
  defined right in your html markup _... see [Native HTML Forms]_.
  
- **SNF** improves user experience by validating fields at the
  appropriate time _... see [Validation Timing]_.
  
- **SNF** provides two simple reactive error display components, that
  "auto wires" themselves to the appropriate form/fields, dynamically
  displaying form-based errors as needed _... see [Reactive Error
  Display]_.

- **SNF** supports the native [HTML5 Form Validation], by using
  the standard validation attributes in your form elements, such as
  `type`, `required`, `minlength`, etc. _... see [Built-In Form
  Validation]_.

- **SNF** allows you to easily apply **custom validations**, where your
  JavaScript code can perform app-specific validation _(even
  involving cross field validations)_
  _... see [Custom Validation]_.
  
- **SNF** is customizable
  **&bull; don't like the error display format?** _... that is easily resolved_
  **&bull; want to perform a custom field validation?** _... easy peasy_
  _... see [Customization]_.


**SNF** promotes a <mark>**clean and simple approach**</mark> to form
validation, that yields <mark>**powerful results**</mark>.

<mark>**Important NOTE**</mark>: **SNF** is intended to be used by applications
that employ native html forms and form elements.  Because of
**SNF**'s usage of svelte actions, **this is a hard restriction**!
_Svelte actions may only be applied to native DOM elements - **not**
components_.  **If you are a minimalist** _(using native html)_, you will
appreciate this abstraction of form/field validation.  **If you are
using a more inclusive UI library**, it most likely already promotes
Form/Element component abstractions _(which will typically provide a
technique to handle form validation)_.

</ul>

<!--- *** Section ************************************************************************* ---> 
## At a Glance

- [Install]
- [Basic Example]
- [Concepts]
  - [Native HTML Forms]
  - [Validation Timing]
  - [Reactive Error Display]
  - [Built-In Form Validation]
  - [Custom Validation]
- [Actions]
  - [`formChecker`]
  - [`fieldChecker`]
- [Components]
  - [`<FormErr>`]
  - [`<FieldErr>`]
- [Controllers]
  - [`formController`]
- [Advanced Concepts]
  - [Svelte Bound Variables]
- [Customization]
  - [Error Look and Feel]
- [Competition]


<!--- *** Section ************************************************************************* ---> 
## Install

?? Installation

<!--- *** Section ************************************************************************* ---> 
## Basic Example

Here is a very basic example of **SNF** usage:

?? AI: would be nice to highlight the SNF specifics (NOT POSSIBLE IN quoted stuff) ?? consider an image?

```html
<script>
 import {formChecker,  FormErr,
         fieldChecker, FieldErr} from 'svelte-native-forms';

 const submit     = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);
 const isIdUnique = ({id}) => id==='dup' ? 'ID must be unique' : '';
</script>

<form use:formChecker={{submit}}>
  <label>
    Name:
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker>
    <FieldErr/>
  </label>

  <label>
    ID:
    <input id="id" name="id" type="text" required minlength="2" maxlength="10"
           use:fieldChecker={{validate: isIdUnique}}>
    <FieldErr/>
  </label>

  <center>
    <FormErr/>
  </center>
  <center>
    <input type="submit" value="Make It SO!">
  </center>
</form>
```

At it's core, this example is using HTML's standard [Built-In Form
Validation].  However with the simple injection **SNF**'s `Checker`
actions, and **SNF**'s **error display** components, a sophisticated
control structure has been applied that promotes a very usable form.
We have even seamlessly introduced a **custom field validation**!

?? IMG: show result

You can interact with this example in the following ?REPL.

Here are some points of interest:

- the `use:formChecker` action is applied to the `<form>`

  - a `submit` function is registered to this action.  This is used in
    lue of the standard `on:submit` event.  This function is invoked
    on a standard `submit` request, but **only when all fields pass
    validation**.  If there are field errors, the appropriate messages
    are displayed, and no submit occurs.

- the `<input>` form elements are employing some standard [Built-In
  Form Validation] constraints _(`type`, `required`, `minlength`, etc.)_.

- the `use:fieldChecker` actions are applied to each `<input>` form
  element.  This completes the knowledge transfer of your form
  structure to **SNF**. (AI: can this be implied when all defaults are
  used?)

  - a **custom field validation** has been introduced _(for the `id`
    field)_, by using the `validate` action parameter.  This invokes a
    function that can apply application-specific validations.  The
    function merely returns an error string _(if invalid)_, or an empty
    string _(when valid)_.

  - the `<FieldErr/>` components will dynamically bind to the input field
    of interest, and conditionally display appropriate errors for that
    field.

- the `<FormErr/>` component dynamically binds to the form, and and
  conditionally displays an appropriate error when a submit is
  requested on an invalid form.

- a standard `submit` control is applied to the form.  As mentioned
  above, the **SNF** `submit` function is only invoked when all fields
  pass validation.



<!--- *** Section ************************************************************************* ---> 
## Concepts

**svelte-native-forms** _(<mark>aka **SNF**</mark>)_ is a [svelte]
utility that facilitates field validation in your native html forms.

The following sections discuss the basic concepts of **SNF**:

- [Native HTML Forms]
- [Validation Timing]
- [Reactive Error Display]
- [Built-In Form Validation]
- [Custom Validation]


<!--- *** Section ************************************************************************* ---> 
## Native HTML Forms

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

In **SNF**, your interactive forms continue to use the native HTML
`<form>` tag along with the corresponding form elements (`<input>`,
`<select>`, `<textarea>`, etc.).  In other words, **SNF** does NOT
introduce components for these abstractions, rather you use the native
html representations.

This is accomplished by using **svelte actions**. By applying a simple
action to your form elements, the basics of the form validation
control is defined right in your html markup.

This represents a different approach from other form validation
libraries.  Some may require you to define a separate JavaScript
control structure that either drives your html markup, or duplicates
the html hierarchy in some way.  Others may introduce their own
component layer on top of the native form elements.

Because **SNF** is action-based, it can utilize your DOM hierarchy
to implicitly define the validation control structure, _making it a
simple and understandable **single source of truth**_.  In other words, _**your form
validation control is defined right in your html markup!**_

</ul>


<!--- *** Section ************************************************************************* ---> 
## Validation Timing

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

Validation timing is an important characteristic in achieving a better
user experience.  You don't want to overwhelm your users by validating
every field from the start, yet once a field has been seen, validation
is more appropriate.

**SNF** employs a validation heuristic, where fields are validated
at the appropriate time:

- only when they have been seen by the user _(i.e. touched)_, 
- or when a submit has been attempted. 

The "touched" determination is made through focus semantics.  A field is
considered to have been touched when it has gone in and out of focus
(i.e. blur).

This heuristic is a common technique that is tedious to accomplish,
_when attempted in application code_.

</ul>


<!--- *** Section ************************************************************************* ---> 
## Reactive Error Display

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**SNF** provides two reactive error display components that
dynamically display appropriate errors as needed.  The beauty of these
components are that they auto-wire themselves to the appropriate
error.  As a result, they are very simple to use.

In the following example, the mere inclusion of `<FieldErr/>` will
dynamically display any **name-field** errors at the appropriate time,
simply because it is contained in the `<label>` that holds the
**name** `<input>` _(this is not the only way to bind errors, but a
very common one)_:

```html
<label>
  Name:
  <input id="name" name="name" type="text" required minlength="3"
         use:fieldChecker>
  <FieldErr/>
</label>
```

There are two reactive error display components:

- [`<FormErr>`]: for displaying form errors
- [`<FieldErr>`]: for displaying field errors


</ul>


<!--- *** Section ************************************************************************* ---> 
## Built-In Form Validation

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

Web standards provide a native way to achieve client-side validation
_(see [HTML5 Form Validation])_.  This is accomplished by simply
applying validation attributes to your form elements, such as `type`,
`required`, `minlength`, `maxlength`, `min`, `max`, `pattern`, etc.

Roughly speaking, this standard is broken up into two parts:

- **validation** _(i.e. built-in validation)_:

  **SNF** supports the continued use of built-in validation, _in
  addition to the ability to easily inject [Custom Validation]_.  In
  other words, you may continue to use the HTML validation attributes
  _(mentioned above)_.  All built-in validation messages are presented
  to the user before any custom validations.

- **presentation** _(of validation errors)_:

  The error presentation provided by standard HTML is somewhat
  primitive and unrefined.  It is for this reason that **SNF** takes
  over the the presentation of validation errors.  This _(in
  conjunction with **SNF**'s **powerful validation heuristic**)_,
  provides a **much improved user experience**.

**SNF** accomplishes this by applying the `novalidate` attribute to
your `<form>` element.  While this disables the **presentation**
aspects of the standard, it leaves the constraint validation API
intact _(along with CSS pseudo-classes like `:valid` etc.)_.  This
allows **SNF** to continue to interpret and support the built-in form
validations!

</ul>



<!--- *** Section ************************************************************************* ---> 
## Custom Validation

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

You can easily apply **custom validations**, where your JavaScript
code provides app-specific validation.  This even includes more
complex things, such as cross field validation!

This is accomplished through the `validate` parameter of the
[`fieldChecker`] action.

The following simple example confirms that the `id` field is unique,
_based on an app-specific `isUnique()` function_.

```html
<input id="id" name="id" type="text" required
       use:fieldChecker={{validate: ({id}) => isUnique(id) ? '' : 'ID must be unique''}}>
```

The `validate` hook can employ any logic _(as complex or simple as
needed)_, and can reason about multiple fields _(not just one)_.
Ultimately it returns a string - which is either an **error** _(for
non-empty strings)_ or **valid** _(for an empty string)_.

</ul>



<!--- *** Section ************************************************************************* ---> 
## Actions

The primary instrument that **SNF** uses are **svelte actions**!  There are two:

1. [`formChecker`]: to be applied to your `<form>` element
2. [`fieldChecker`]: to be applied to your interactive form elements (`<input>`, `<select>`, `<textarea>`, etc.)


<!--- *** Section ************************************************************************* ---> 
## `formChecker`

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The `formChecker` svelte action is applied to your html `<form>`
element.  It registers the form to **SNF** control, allowing it
orchestrate form validation.

**Action Usage:**

```html
<script>
 import {formChecker} from 'svelte-native-forms';

 const submit = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);
</script>

<form use:formChecker={{submit}}>
  ... snip snip
</form>
```

**Action Parameters:**

The `formChecker` action supports the following parameters:

- **`submit`**: a required submit function that executes a
  client-specific process.  This is invoked when a submit occurs, only
  when all fields pass validation.

  **submit() API:**
  ```
  + submit(event, fieldValues): void
    NOTE: All field values (monitored by SNF) are passed as named parameters.
  ```

- **`errStyles`**: an optional object containing the in-line styles to
  apply to input elements that are in error.

  - use an object with in-line styling pairs: camelCaseKey/value
  - or `null` to disable
   
  **DEFAULT**:
  ```
  {
    border:          '2px solid #900', ... solid red border
    backgroundColor: '#FDD',           ... pink background
  }
  ```

**formController:**

The `formChecker` action promotes a `formController` API through
which your application can programmatically make various form-specific
requests _(like resetting the form)_.  Please refer to the
[`formController`] section for a discussion of this API _(and how to
access it)_.

</ul>


<!--- *** Section ************************************************************************* ---> 
## `fieldChecker`

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The `fieldChecker` svelte action is applied to your interactive form
elements (`<input>`, `<select>`, `<textarea>`, etc.).  It registers
the form element to **SNF** control, allowing it to participate in the
form's validation.  In addition it injects the form value into the set
of `formFields` passed to your submit function.

If your field has **no validation** constraints, this action is
completely optional.  The only down-side to omitting the action is
that the field value will NOT be included in the set of `formFields`
passed to your submit function.

Form elements containing this action **must have** a `name` or `id`
attribute.  While this is a common form requirement, in the case of
`fieldChecker`, it derives it's `fieldName` from these attributes
_(the `name` attribute takes precedence over `id`)_.

AI: ?? per web standards I think a form submission REQUIRES a `name` attribute
- however **SNF** may need id to sync up various elements
- this may need to be tweaked (however we need to play with ALL the form elements)


**Action Usage:**

```html
<script>
 import {formChecker} from 'svelte-native-forms';
</script>

... in the context of a form:

    ... NO action parameters (all defaulted)
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker>

    ... WITH action parameters
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker={{validate, initialValue: 'WowZee'}}>
  
... snip snip
```

**Action Parameters:**

The `fieldChecker` action supports the following parameters _(all optional)_:

- **`validate`**: an optional function that applies custom
  client-specific validation to this field.

  **DEFAULT**: NO custom validation is applied ... only [Built-In Form
  Validation] _(e.g. `type`, `required`, `minlength`, etc.)_

  **validate() API:**
  ```
  + validate(fieldValues): errMsgStr (use '' for valid)
    NOTE: All field values are passed as named parameters,
          supporting complex inner-dependent field validation
            EX: validate({address, zip}) ...
          Typically you only access the single field being validated
            EX: validate({address}) ...
  ```

  **validate() example:** ?? more realistic
  ```js
  function validate({foo}) {
    return foo==='dup' ? 'foo must be unique' : '';
  }
  ```

- **`initialValue`**: optionally, the initial value to apply to this
  field, both on DOM creation and `reset()` functionality.

  **DEFAULT**: NO initial value is programmatically applied.  In other
  words the initial value is strictly defined by your html.

- **`boundValue`**: optionally, the application variable bound to this
  fieldNode.  This is required when svelte's `bind:value` is in affect
  _(due to a web limitation, see: [Svelte Bound Variables])_.

- **`changeBoundValue`**: optionally, a client function that changes
  it's bound value.  This is required when **SNF**'s `initialValue`
  and `boundValue` are in affect _(also due to the same web limitation,
  see: [more when `initialValue` in use ...])_.

  **changeBoundValue() API:**
  ```
  + changeBoundValue(initialValue): void
    ... the implementation should update the client boundValue to the supplied initialValue
  ```

</ul>


<!--- *** Section ************************************************************************* ---> 
## Components

**SNF** promotes two reactive components that display form-based error
messages in your application:

- [`<FormErr>`]: for displaying form errors
- [`<FieldErr>`]: for displaying field errors

The beauty of these components are that they auto-wire themselves to
the appropriate error.  As a result, they are very simple to use.


<!--- *** Section ************************************************************************* ---> 
## `<FormErr>`

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The `<FormErr>` component dynamically displays a generalized message
when something is wrong with one or more form fields.  The default
message is: <span style="font-size: 80%; font-weight: bold;
color:red;">Please correct the highlighted field errors</span> but can
easily be overwritten through the `errMsg` property.

`<FormErr>` <mark>must be a descendant of</mark> a `<form>` that is
controlled by a `formChecker` action.  This is how it implicitly
auto-wires itself to the form's error status.

**Usage:**

```html
<form use:formChecker={{submit}}>
  ... snip snip
  <FormErr/>
</form>
```

**Visual:**

?? screen shot

**API:**
```
<FormErr [errMsg={}]    ... the generalized form-based error message
                            DEFAULT: "Please correct the highlighted field errors"
         [DispErr={}]/> ... the display component that renders the error
                            ACCEPTS: errMsg property ... an empty string ('') represents NO error
                            DEFAULT: the standard internal error display component
```

**Customization:**

Please refer to the [Error Look and Feel] section to see how you can
customize the display of your error messages _(using the `DispErr`
property)_.

</ul>


<!--- *** Section ************************************************************************* ---> 
## `<FieldErr>`

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The `<FieldErr>` component dynamically displays a field-specific
message when the field it is monitoring is invalid.

This component auto-wires itself to the monitored field of interest
either through the `forName` property, or implicitly through
it's placement within a `<label>` container _(see **Usage** below)_.

**Usage** _(via `forName`)_:

<ul>

```html
<FieldErr forName="zip"/>
```

In this case, the monitored field is identified through the **SNF**
defined `fieldName` _(which can be the DOM `name` or `id` attributes,
`name` taking precedence)_.

Example: `<input id="wow" name="zip" use:fieldChecker ...>`

</ul>


**Usage** _(via implicit `label` containment)_:

<ul>

```html
<label>
  Zip:
  <input name="zip" type="text" required use:fieldChecker>
  <FieldErr/>
</label>
```

In this case, the monitored field is implicitly identified through
it's placement in a `<label>` container.  Both the field and
`<FieldErr>` are nested in a `<label>` element.  This is similar to
how an `<input>` element can be implicitly associated to it's
`<label>`.

</ul>


**Visual:**

?? screen shot

**API:**
```
<FieldErr [forName=""]   ... identifies the field to monitor errors on, as defined by the SNF
                             fieldName (which can be the DOM name or id attributes, name taking
                             precedence)
                             DEFAULT: implicit <label> containment
          [DispErr={}]/> ... the display component that renders the error
                             ACCEPTS: errMsg property ... an empty string ('') represents NO error
                             DEFAULT: the standard internal error display component
```

**Customization:**


Please refer to the [Error Look and Feel] section to see how you can
customize the display of your error messages _(using the `DispErr`
property)_.

</ul>



<!--- *** Section ************************************************************************* ---> 
## Controllers

**SNF** promotes public APIs through which application code can
programmatically make various requests.

- These API's are created and promoted by **SNF** actions, and
  therefore are scoped to the DOM controlled by the action.

- Access to these API's are provided through event handlers. The
  reason for this is there is **no direct way to return content from
  svelte actions**.  Please refer to content _(below)_ for details on
  each controller.
  
- _**While this probably goes without saying**_, these APIs should not
  be used outside the scope of the action that created them.  As an
  "internal note", there is no process by which an event notification
  can mark them as stale, because the action-attached DOM element has
  already been removed prior to any action life-cycle notification.

  If the application violates this tenet, the API will throw an Error
  such as:
  
  ```
  ***ERROR*** formController.reset(): stale reference, the formCheckerAction DOM has been removed!
  ```

- These APIs promote **true functions (not methods)**.  In other words
  their execution does **not** require a `controller` dereference.  As
  an example, the following snippet retains a "function only"
  _(without invocation)_ ... so on event handler invocation, it is
  truly a function:
  
  ```html
  <button on:click|preventDefault={formController.reset}>Reset</button>
  ```


<!--- *** Section ************************************************************************* ---> 
## `formController`

<ul>

The `formController` is specific to a `<form>` _(i.e. the
[`formChecker`] action)_.


**`formController` API:**

_Currently, this API promotes only one function (but provides a place
for future expansion)_.  

```
{
  + reset(): void ... reset the form back to it's original state.
}
```

Here are the specifics of each function:

- `+ formController.reset(): void`

  This resets the form back to it's original state, including:

  - initial field values _(as supplied through the [`fieldChecker`]
    `initialValue` action parameter)_
  - clear all error state _(both form and fields)_
    * form error message
    * field error messages
  - reset **Validation Timing** heuristics _(both form and fields)_
    * form as "submit NOT attempted"
    * fields as "not been touched"

  A reset is useful when a form is re-used by retaining it's DOM
  representation _(say when used in a form-based dialog)_.


**Accessing `formController`:**

Because svelte actions have **no direct way to return content to the
client**, a `form-controller` event is emitted that contains the
`formController` _(found in `event.detail.formController`)_.  The
application can simply monitor this event _(on the `<form>` element)_,
and retain the `formController` for it's use.  Here is an example:

```html
<script>
 let formController;
 ... snip snip
</script>

<form use:formChecker={{submit}}
      on:form-controller={ (e) => formController = e.detail.formController }>
  ... snip snip
</form>
```

</ul>


<!--- *** Section ************************************************************************* ---> 
## Advanced Concepts

The following sections discuss more advanced concepts of **SNF**:

- [Svelte Bound Variables]


<!--- *** Section ************************************************************************* ---> 
## Svelte Bound Variables

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

A very powerful feature of svelte is it's ability to provide a two-way
binding between form elements and JS variables.  By simply using the
`bind:` directive these two aspects are kept "in sync".  For example:

```html
<script>
	let name = 'World';
</script>

<input id="name" name="name"
       bind:value={name}>

<h1>Hello {name}!</h1>
```

For **SNF** usage, when two-way bindings are in affect, the
`boundValue` parameter must be specified in the [`fieldChecker`]
action.  For example:

```html
<input id="name" name="name"
       bind:value={name}
       use:fieldChecker={{boundValue: name}}>
```

_**Why is this required?  It seems a bit cumbersome!**_

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

As it turns out, this has nothing to do with svelte or the **SNF**
library.  Rather it is a limitation of the web itself, where updates
to `fieldNode.value` **do not** emit any web events _(such as the
`on:input` event)_.

- Svelte manages it's two-way binding by directly managing the
  `fieldNode.value`.
  
- By default, **SNF** monitors form element changes through the 
  `on:input` event.

Because of this web limitation, **SNF** requires visibility to
`boundValues`, in order to have access to a "single source of truth".
This is unfortunate, but there is nothing we can do about it :-(

</ul>

### more when `initialValue` in use ...

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

This limitation gets worse, when you specify an `initialValue` for
bound elements.  In this scenario **SNF** must update the "single
source of truth", which _(in this case)_ is the `boundValue`.  This
cannot be accomplished by **SNF** directly, because the svelte
compiler must have visibility of this change.  As a result, when BOTH
`initialValue` and `boundValue` are in affect, the client must also
specify a `changeBoundValue` function.  For example:

```html
<input id="name" name="name"
       bind:value={name}
       use:fieldChecker={{
         initialValue: 'WowZee',
         boundValue: name,
         changeBoundValue: (initialValue) => name = initialValue
       }}>
```

**changeBoundValue() API:**
```
+ changeBoundValue(initialValue): void
  ... the implementation should update the client boundValue to the supplied initialValue
```

</ul>

</ul>


<!--- *** Section ************************************************************************* ---> 
## Customization

**SNF** is customizable!

- **don't like the error display format?** _... that is easily resolved_
- **want to perform a custom field validation?** _... easy peasy_

The following sections discuss various **customization features**:

- [Error Look and Feel]


<!--- *** Section ************************************************************************* ---> 
## Error Look and Feel

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**SNF** provides two reactive error display components that
dynamically display appropriate errors as needed ([`<FormErr>`] and
[`<FieldErr>`]).  

**The "Look and Feel" of these components can easily be overridden.**
They merely monitor the appropriate reflective error state, and defer
their display to an internal `<DispErr>` component _(passing the
`errMsg` to display ... where an empty string (`''`) represents no error)_.

This display component is extremely simple!  It styles and displays
the message using animation.  Here is the default implementation:

**DispErr.svelte** _... the **DEFAULT** internal display component_
```html
<script>
 import {fade} from 'svelte/transition';
 export let errMsg;
</script>

{#if errMsg}
  <span class="error" transition:fade>
    {errMsg}
  </span>
{/if}

<style>
 .error {
   font-size:    80%;
   font-weight:  bold;
   font-style:   italic;
   color:        #900;
 }
</style>
```

Because of it's simplicity, you can easily implement your own display
component and pass it to [`<FormErr>`]/[`<FieldErr>`] through the
`DispErr` property.  Simply use the `DispErr.svelte` _(above)_ as a
pattern.  _**You can tailor the style and animation to your
application needs!**_

Here is an example that overrides the default:

```html
<FormErr DispErr={MyErrComp}/>
```

AI: ?? Provide a full-blown example that overrides the internal DispErr component.  Here are some ideas:

- NOTE: this covers BOTH FieldErr and FormErr
- change the animation
- change the error display into a red box via the following form style:
  ```
  <style>
   .formError {
     padding:          0.3em;
     font-size:        80%;
     color:            white;
     background-color: #900;
     border-radius:    5px;
     box-sizing:       border-box;
   }
  </style>
  ```
- here is the corresponding field style (a red box with square top so it looks like part of the input):
  ```
  <style>
   .fieldError {
     width:            100%;
     padding:          0.3em;
     font-size:        80%;
     color:            white;
     background-color: #900;
     border-radius:    0 0 5px 5px;
     box-sizing:       border-box;
   }
  </style>
  ```

</ul>


<!--- *** Section ************************************************************************* ---> 
## Competition

Quick review of current validation utils on ["made with svelte"] ...

**<mark>BOTTOM LINE</mark>**
- think twice about joining the mix
- there is a lot to think about here
- may be too time consuming
- there are a couple of form/validation libs that look robust



**sveltejs-forms**
<ul>
Declarative Forms (KJB: NO NO NO: full form library)

- https://madewithsvelte.com/sveltejs-forms
- https://github.com/mdauner/sveltejs-forms
- https://www.npmjs.com/package/sveltejs-forms <<< 400 weekly downloads

</ul>



**<mark>Sveltik</mark>**
<ul>
Form Library inspired by Formik (KJB: MAY BE minimalist COMPETITION <<< looks robust)

- https://madewithsvelte.com/sveltik
- https://nathancahill.com/sveltik/introducing
- https://github.com/nathancahill/sveltik
- https://www.npmjs.com/package/sveltik <<< 323 weekly downloads
- <mark>NOT sure I like</mark> the `let:xxx` usage, HOWEVER this may open it up to BOTH native/component forms

```
* seems lightweight
* communicates with let:xxx directives
* can use native form/formElm
* has a <Sveltik> component that can wrap the entire native form (again communicating via let:xxx)
* also has option of <Form>/<Field> components
  KOOL: they can actually wrap native elms (using slots) <<< this is what I should do in my ErrorMsg
* have <ErrorMessage> component ... must tell it what it's used for (just like mine)
  <ErrorMessage name="email" as="div"/>
```
</ul>



**<mark>Svelte Forms Lib</mark>**
<ul>
Lightweight Library for Managing Forms - inspired by Formik (KJB: MAY BE minimalist COMPETITION <<< looks robust)

- https://madewithsvelte.com/svelte-forms-lib
- https://svelte-forms-lib-sapper-docs.tjin.now.sh/introduction <<< extensive docs
- https://github.com/tjinauyeung/svelte-forms-lib
- https://www.npmjs.com/package/svelte-forms-lib <<< 700 weekly downloads

```
* must setup some structure
  - uses what it calls observables WHICH I think are Svelte stores
  - BASED ON THIS, it seems a bit complicated to use
* but then use native <form> <input> too
  - it also has "Helper components"
  - it has styling overrides (via global classes)
* custom validation is very similar to mine (is procedural), 
  however it has ONE form validator function that must set errors for all fields <<< hmmmm
```
</ul>



**Svelte Svelte Formly**
<ul>
A Form Generator (KJB: NO NO NO)

- https://madewithsvelte.com/svelte-formly
- https://github.com/arabdevelop/svelte-formly
- https://www.npmjs.com/package/svelte-formly <<< 50 downloads a week

```
* must setup some structure
  - seems kinda clunky
* THEN you have a single <Field {fields}> <<< suspect is too intrusive/opinionated
  - i.e. it is a generator
```
</ul>






<!--- *** REFERENCE LINKS ************************************************************************* ---> 

<!--- **SNF** ---> 
[Install]:                               #install
[Basic Example]:                         #basic-example
[Concepts]:                              #concepts
  [Native HTML Forms]:                   #native-html-forms
  [Validation Timing]:                   #validation-timing
  [Reactive Error Display]:              #reactive-error-display
  [Built-In Form Validation]:            #built-in-form-validation
  [Custom Validation]:                   #custom-validation
[Actions]:                               #actions
  [`formChecker`]:                       #formchecker
  [`fieldChecker`]:                      #fieldchecker
[Components]:                            #components
  [`<FormErr>`]:                         #formerr
  [`<FieldErr>`]:                        #fielderr
[Controllers]:                           #controllers
  [`formController`]:                    #formcontroller
[Advanced Concepts]:                     #advanced-concepts
  [Svelte Bound Variables]:              #svelte-bound-variables
  [more when `initialValue` in use ...]: #more-when-initialvalue-in-use-
[Customization]:                         #customization
  [Error Look and Feel]:                 #error-look-and-feel
[Competition]:                           #competition

<!--- external links ---> 
[svelte]:                   https://svelte.dev/
["made with svelte"]:       https://madewithsvelte.com/form
[HTML5 Form Validation]:    https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
[HTML5's Form Validation]:  https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
