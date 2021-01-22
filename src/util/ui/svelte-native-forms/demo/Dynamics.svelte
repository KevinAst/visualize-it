<script>
 import {fade}          from 'svelte/transition';
 import {formChecker,  FormErr,
         fieldChecker, FieldErr} from '../../svelte-native-forms';

 const pkgEntryTypes = ['Component', 'Scene', 'Collage', 'Directory'];
 let   pkgEntryType  = pkgEntryTypes[0];

 let formController;

 function addPkgEntry(e, fieldValues) {
   // console.log('XX addPkgEntry() invoked!', {event: e, fieldValues});
   alert('addPkgEntry() invoked: all fields are valid!');
 }
</script>

<form on:form-controller={ (e) => formController = e.detail.formController }
      use:formChecker={{submit: addPkgEntry}}>

  <!-- PkgEntryType -->
  {#each pkgEntryTypes as t}
    <label class="spacer">
      <input type="radio" value={t} bind:group={pkgEntryType}>
      {t}
    </label>
  {/each}

  <table> <!-- table provides nicely aligned labels -->
    <!-- Name -->
    <tr>
      <th><label for="name">Name:</label></th>
      <td>
        <input id="name" name="name" type="text" required minlength="3"
               use:fieldChecker={{validate: ({name}) => name==='dup' ? 'Name must be unique' : ''}}>
        <FieldErr forName="name"/>
      </td>
    </tr>

    <!-- ID (un-needed for directories) KEY: NOTICE this dynamically changes validation requirements!  -->
    {#if pkgEntryType !== 'Directory'}
    <tr transition:fade>
      <th><label for="id">ID:</label></th>
      <td>
        <input id="id" name="id" type="text" required minlength="2" maxlength="10"
               use:fieldChecker={{validate: ({id}) => id==='dup' ? 'ID must be unique' : ''}}>
        <FieldErr forName="id"/>
      </td>
    </tr>
    {/if}
  </table>

  <hr/>

  <!-- form error message -->
  <center>
    <FormErr/>
  </center>

  <!-- control buttons -->
  <center>
    <button>Add</button>
    <button on:click|preventDefault={formController.reset}>Reset</button>
  </center>

</form>


<style>
 label {
   user-select: none;    /* prevent test selection of labels */
   cursor:      pointer; /* ?? may not want this for other labels ... unless it selects the text field */
 }

 .spacer {
   display: inline;  /* adjust label to be on single line */
   margin:  0px 5px; /* with the proper spacing */
 }

 td {
	 padding-top:    4px; /* restores spacing removed from input (see margin below) */
	 padding-bottom: 4px;
 }

 th {
   vertical-align: top;  /* "fix" label position when error is rendered */
	 padding-top:    8px;  /* center relative to input */
   text-align:     left;
 }

 input {
   margin: 0px; /* "joins" error msg right below the cooresponding input */
 }
</style>
