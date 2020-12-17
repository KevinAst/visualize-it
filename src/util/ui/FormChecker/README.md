# FormChecker 

*... minimalist form/field validation with powerful results*

?? Introduction Paragraph

<!--- *** Section ************************************************************************* ---> 
**Overview:**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

?? Overview Section

?? a minimalist approach to form field validation that delivers powerful results

**Important NOTE**: FormChecker is intended to be used by applications
that utilize native html forms and form elements.  Because of
FormChecker's usage of svelte actions, **this is a hard restriction**!
_Svelte actions may only be used with native dom elements - **not**
Components_.  **If you are a minimalist** _(using native html)_, you will
appreciate this abstraction of form/field validation.  **If you are
using a more inclusive UI library**, it probably already promotes
Form/Element component abstractions _(which will typically provide a
technique to handle form validation)_.

?? SIMPLE and UNDERSTANDABLE ... everything is defined right in your DOM structure
- ex: the fieldValidator action is attached right to your interactive form element
- ex: custom field validations is logic right in your interactive form element
- ex: want to change the Form Error Message: it is right in the <FormErr> component

?? use the term "touched" NOT "has been seen"


</ul>

<!--- *** Section ************************************************************************* ---> 
## At a Glance

- [Install](#install)
- more
- [Components](#components)
  - [`<FormErr>`]
  - [`<FieldErr>`]
- [Competition](#competition)


<!--- *** Section ************************************************************************* ---> 
## Install

?? Installation


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
                            DEFAULT: the standard form-based error component
```

**Customization:**

The `<FormErr>` component simply monitors the reflective state of form
errors, and defers it's display to an internal `<DispErrForm>`,
passing it the `errMsg` string _(an empty string (`''`) represents no
error)_.

This display component is extremely simple.  It styles the message and
dynamically displays it using animation:

**DispErrForm.svelte** _... the internal default component_
```html
<script>
 import {fade} from 'svelte/transition';
 export let errMsg;
</script>

{#if errMsg}
  <span class="formError" transition:fade>
    {errMsg}
  </span>
{/if}

<style>
 .formError {
   font-size:    80%;
   font-weight:  bold;
   color:        #900;
 }
</style>
```

Because of it's simplicity, you can easily implement your own display
component and pass it to `<FormErr>` through the `DispErr` property.
Simply use the `DispErrForm.svelte` _(above)_ as a pattern.  _**You
can taylor the style and animation to your application needs!**_ Here
is an example that overrides the default:

```html
<!-- form error message -->
<center>
  <FormErr {formChecker} DispErr={MyErrComp}/>
</center>
```

AI: ?? Provide a full-blown example that overrides the internal DispErrForm component.  Here are some ideas:

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

["made with svelte"]:  https://madewithsvelte.com/form
