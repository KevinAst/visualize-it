# svelte-form-checker

*... minimalist form validation with powerful results*

<!---  REFINED FROM: Constraint Validation: Native Client Side Validation for Web Forms ... https://www.html5rocks.com/en/tutorials/forms/constraintvalidation/
       Validating forms has notoriously been a painful development
       experience. Implementing client side validation in a user friendly,
       developer friendly, and accessible way is hard. Before HTML5 there was
       no means of implementing validation natively; therefore, developers
       have resorted to a variety of JavaScript based solutions.
 ---> 

Validating forms has notoriously been a painful development
experience.  Implementing client side validation _in a user friendly
way **is simply hard to accomplish**_
&hellip; you want to validate fields only at the appropriate time _(when the
user has had the chance to enter the data)_
&bull; you want to present validation errors in a pleasing way
&bull; you may need to apply custom validation _(specific to your
application domain)_

<!--- AI: should following sentence reference HTML5's Constraint Validation https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation ---> 

Even with the introduction of [HTML5's Form Validation], it is still
overly complex, and doesn't address many common scenarios _(mentioned
above)_.  Without the proper approach, form validation can be one of
the most difficult tasks in web development.

<!--- *** Section ************************************************************************* ---> 
**Overview:**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

**svelte-form-checker** _(<mark>aka **SFC**</mark>)_ is a [svelte] utility that
facilitates field validation in your native html forms.

The term _**native**_ refers to the utilization of the native HTML
`<form>` tag and it' corresponding form elements (`<input>`,
`<select>`, `<textarea>`, etc.).  In other words, **SFC** does NOT
introduce components for these abstractions, rather you use the native
html representations.

Here are some **key points** to understand:

- **SFC** is based on **svelte actions**.  By applying a simple action
  to your form elements, the basics of the form validation control is
  defined right in your html markup.  

  This represents a different approach from other form validation
  libraries, that require you to define a separate JavaScript control
  structure that either drives your html markup, or duplicates the
  html hierarchy in some way.

  Because **SFC** is action-based, it can utilize your DOM hierarchy
  to implicitly define the validation control structure, _making it a
  simple and understandable **single source of truth**_.  In other words, _**your form
  validation control is defined right in your html markup!**_
  
- **SFC** promotes a reactive error display component, that "auto
  wires" itself to appropriate field errors, dynamically displaying form
  errors as needed.
  
- **SFC** employs a powerful validation heuristic, where fields are
  validated only when they have been seen by the user _(i.e. touched)_, or
  when a submit is attempted.  This is a commonly used approach that is
  tedious to accomplish _(when implemented in application code)_.
  
- **SFC** is customizable
  **&bull; don't like the error display format?** _&hellip; that is easily resolved_
  **&bull; want to perform a custom field validation?** _&hellip; easy peasy_

**SFC** promotes a <mark>**clean and simple approach**</mark> to form
validation, that yields <mark>**powerful results**</mark>.

**Important NOTE**: FormChecker is intended to be used by applications
that employ native html forms and form elements.  Because of
FormChecker's usage of svelte actions, **this is a hard restriction**!
_Svelte actions may only be applied to native DOM elements - **not**
components_.  **If you are a minimalist** _(using native html)_, you will
appreciate this abstraction of form/field validation.  **If you are
using a more inclusive UI library**, it most likely already promotes
Form/Element component abstractions _(which will typically provide a
technique to handle form validation)_.

</ul>

<!--- *** Section ************************************************************************* ---> 
## At a Glance

- [Install](#install)
- [Basics](#basics)
- more
- [Components](#components)
  - [`<FormErr>`]
  - [`<FieldErr>`]
- [Competition](#competition)


<!--- *** Section ************************************************************************* ---> 
## Install

?? Installation


<!--- *** Section ************************************************************************* ---> 
## Basics

Here is a very basic example of **SFC** usage:

?? AI: would be nice to highlight the SFC specifics (NOT POSSIBLE IN quoted stuff) ?? consider an image?

```html
<script>
 import {formChecker,  FormErr,
         fieldChecker, FieldErr} from 'svelte-form-checker';

 const submit     = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);
 const isIdUnique = (event, {id}) => id==='dup' ? 'ID must be unique' : '';
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

At it's core, this example is using the standard [HTML5 Form
Validation].  However with the simple injection **SFC**'s `Checker`
actions, and **SFC**'s **error display** components, a sophisticated
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

- the `<input>` form elements are employing some standard [HTML5 Form
  Validation] constraints (`required`, `minlength`, etc.).

- the `use:fieldChecker` actions are applied to each `<input>` form
  element.  This completes the knowledge transfer of your form
  structure to **SFC**. (AI: can this be implied when all defaults are
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
  above, the **SFC** `submit` function is only invoked when all fields
  pass validation.


<!--- *** Section ************************************************************************* ---> 
## Components

**FormChecker** promotes two simple components, both related to
displaying form-based error messages in your application.

1. [`<FormErr>`]: for displaying form errors
2. [`<FieldErr>`]: for displaying field errors


<!--- *** Section ************************************************************************* ---> 
## `<FormErr>`

This component conditionally displays a generalized message when
something is wrong with one or more form fields.  The default message
is: <span style="font-size: 80%; font-weight: bold; color:red;">Please
correct the highlighted field errors</span> but can easily be
overwritten through the `errMsg` property.

**Usage:**

```html
<!-- form error message -->
<center>
  <FormErr {formChecker}/>
</center>
```

?# The `<FormErr>` <mark>**must** be placed</mark> within the `<form>`
for which it is monitoring.  By doing this, it will auto-bind to the
errors from that form!

**Visual:**

?? screen shot

**API:**
```
<FormErr formChecker={} ... the FormChecker object to monitor errors on
         [errMsg={}]    ... the generalized form-based error message
                            DEFAULT: "Please correct the highlighted field errors"
         [DispErr={}]/> ... the display component that renders the error
                            DEFAULT: the standard internal error display component
```

**Customization:**

The `<FormErr>` component simply monitors the reflective state of form
errors, and defers it's display to an internal `<DispErr>`,
passing it the `errMsg` string _(an empty string (`''`) represents no
error)_.

This display component is extremely simple.  It styles the message and
dynamically displays it using animation:

**DispErr.svelte** _... the internal default component_
```html
<script>
 import {fade} from 'svelte/transition';
 export let errMsg;
</script>

{#if errMsg}
  <div class="error" transition:fade>
    {errMsg}
  </div>
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
component and pass it to `<FormErr>` through the `DispErr` property.
Simply use the `DispErr.svelte` _(above)_ as a pattern.  _**You
can tailor the style and animation to your application needs!**_ Here
is an example that overrides the default:

```html
<!-- form error message -->
<center>
  <FormErr {formChecker} DispErr={MyErrComp}/>
</center>
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


<!--- *** Section ************************************************************************* ---> 
## `<FieldErr>`

This component conditionally displays a field-specific message when
the field it is monitoring is invalid.

**Usage:**

```html
<!-- field error message -->
?# retrofit to what it ultimately looks like for field defs
<FieldErr {fieldChecker}/>
```

?# The `<FieldErr>` <mark>**must** identify the field it is
monitoring</mark>, either through the `forFieldId` property, or it's
placement within a `<label>` container By doing this, it will
auto-bind to the errors from that field!

**Visual:**

?? screen shot

**API:**
```
<FieldErr fieldChecker={} ... the FieldChecker object to monitor errors on
          [DispErr={}]/>  ... the display component that renders the error
                              DEFAULT: the standard internal error display component
```

**Customization:**

The `<FieldErr>` component simply monitors the reflective error state
of the field it is monitoring, and defers it's display to an internal
`<DispErr>`, passing it the `errMsg` string _(an empty string (`''`)
represents no error)_.

This display component is extremely simple.  It styles the message and
dynamically displays it using animation:

?? THIS IS MOSTLY A DUPLICATE (from `<FieldErr>`)

**DispErr.svelte** _... the internal default component_
```html
<script>
 import {fade} from 'svelte/transition';
 export let errMsg;
</script>

{#if errMsg}
  <div class="error" transition:fade>
    {errMsg}
  </div>
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
component and pass it to `<FieldErr>` through the `DispErr` property.
Simply use the `DispErr.svelte` _(above)_ as a pattern.  _**You
can tailor the style and animation to your application needs!**_ Here
is an example that overrides the default:

```html
<FieldErr {fieldChecker} DispErr={MyErrComp}/>
```



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

<!--- **FormChecker** ---> 
[`<FormErr>`]:       #formerr
[`<FieldErr>`]:      #fielderr


<!--- external links ---> 
[svelte]:                   https://svelte.dev/
["made with svelte"]:       https://madewithsvelte.com/form
[HTML5 Form Validation]:    https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
[HTML5's Form Validation]:  https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
