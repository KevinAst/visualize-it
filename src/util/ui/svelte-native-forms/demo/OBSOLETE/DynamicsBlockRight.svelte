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

<h5>DynamicsBlockRight - styled with fixed width label (errors to right)</h5>

<form use:formChecker={{submit: addPkgEntry}}
      on:form-controller={retainController}>

  <!-- PkgEntryType -->
  {#each pkgEntryTypes as t}
  <label class="radio">
    <input type="radio" value={t} bind:group={pkgEntryType}>
    {t}
  </label>
  {/each}

  <label>
    <b>Name:</b>
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker={{validate: ({name}) => name==='dup' ? 'Name must be unique' : ''}}>
    <i><FieldErr/></i>
  </label>

  <!-- ID (un-needed for directories) KEY: NOTICE this dynamically changes validation requirements!  -->
  {#if pkgEntryType !== 'Directory'}
  <label>
    <b>ID:</b>
    <input id="id" name="id" type="text" required minlength="2" maxlength="10"
           use:fieldChecker={{validate: ({id}) => id==='dup' ? 'ID must be unique' : ''}}>
    <i><FieldErr/></i>
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
 }

 /* align radio on same line */
 .radio {
   display: inline;   /* adjacent labels on same line */
   margin:  0px 10px; /* with the proper spacing */
 }

 /* FOLLOWING: a "simple" technique to align labels and limit error size
    (short and sweet) - although a bit hoaky with fixed widths */

 b { /* used for labels */
   display: inline-block;
   width:   50px;
 }

 i { /* used for errors */
   display: inline-block;
   width:   250px;
 }

</style>
