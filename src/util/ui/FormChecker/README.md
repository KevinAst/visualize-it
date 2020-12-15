
?? a minimalist approach to form field validation that delivers powerful results

?? use the term "touched" NOT "has been seen"

?? here is a design CON in our library using action-centric directives:
- we are limited in using native form/elm items
- BECAUSE: svelte actions can ONLY be used with native elements, NOT Components



## Competition

Quick review of current validation utils on ["made with svelte"](https://madewithsvelte.com/form) ...

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
  - seems kinda klunky
* THEN you have a single <Field {fields}> <<< suspect is too intrusive/opinionated
  - i.e. it is a generator
```
</ul>
