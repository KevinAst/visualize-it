<script>
 import {fade}                   from 'svelte/transition';
 import {formChecker,  FormErr,
         fieldChecker, FieldErr} from '../../../svelte-native-forms';

 const pkgEntryTypes = ['Component', 'Scene', 'Collage', 'Directory'];
 let   pkgEntryType  = pkgEntryTypes[0];

 let formController;
 function retainController(e) {
   formController = e.detail.formController;
 }

 function addPkgEntry(e, fieldValues) {
   // console.log('XX addPkgEntry() invoked!', {event: e, fieldValues});
   alert('addPkgEntry() invoked: all fields are valid!');
 }
</script>

<h5>DynamicsUnderRight - new-line labels (errors to right)</h5>

<form use:formChecker={{submit: addPkgEntry}}
      on:form-controller={retainController}>

  <!-- PkgEntryType -->
  <label>
    Type:
    {#each pkgEntryTypes as t}
    <label class="radio">
      <input type="radio" value={t} bind:group={pkgEntryType}>
      {t}
    </label>
    {/each}
  </label>

  <label>
    Name:<br/>
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker={{validate: ({name}) => name==='dup' ? 'Name must be unique' : ''}}>
    <FieldErr/>
  </label>

  <!-- ID (un-needed for directories) KEY: NOTICE this dynamically changes validation requirements!  -->
  {#if pkgEntryType !== 'Directory'}
  <label>
    ID:<br/>
    <input id="id" name="id" type="text" required minlength="2" maxlength="10"
           use:fieldChecker={{validate: ({id}) => id==='dup' ? 'ID must be unique' : ''}}>
    <FieldErr/>
  </label>
  {/if}

  <hr/>

  <p><FormErr/></p>
  <p>
    <button>Add</button>
    <button on:click|preventDefault={formController.reset}>Reset</button>
    <p>

</form>


<style>
 label {
   user-select: none;    /* prevent text selection of labels */
   cursor:      pointer; /* hover as pointer */
   font-weight: bold;
 }

 /* align radio on same line */
 .radio {
   display: inline;   /* adjacent labels on same line */
   margin:  0px 10px; /* with the proper spacing */
 }
</style>
