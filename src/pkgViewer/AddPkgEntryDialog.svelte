<script>
 // ?? ?#: further refinement for Phase II
 import {fade}          from 'svelte/transition';
 import Dialog          from '../util/ui/Dialog.svelte';
 import {FormChecker,
         FieldChecker,
         FieldErr,
         FormErr}       from '../util/ui/FormChecker';

 // component parameters
 export let pkg;

 let   addPkgEntryDialog = null;

 const pkgEntryTypes     = ['Component', 'Scene', 'Collage', 'Directory'];
 let   pkgEntryType      = 'Component';

 const nameChecker       = new FieldChecker({id: 'name', validationFn: validateName});
 const nameCheckerAction = nameChecker.action; // ... cannot dereference an object in svelte's "use:action" syntax :-(

 const idChecker         = new FieldChecker({id: 'id', validationFn: validateId});
 const idCheckerAction   = idChecker.action; // ... cannot dereference an object in svelte's "use:action" syntax :-(

 const formChecker       = new FormChecker({name: 'AddPkgEntry', submitFn: addPkgEntry, fieldCheckers: [nameChecker, idChecker]});
 const formCheckerAction = formChecker.action; // ... cannot dereference an object in svelte's "use:action" syntax :-(

 // console.log(`XX test to visualize toString():\n${formChecker}`);

 export async function showModal() {
   addPkgEntryDialog.showModal();
 }

 function addPkgEntry(e, fieldValues) {
   //console.log('XX ViewPkg: addPkgEntry() invoked!', {event: e, fieldValues});
   alert('ViewPkg: addPkgEntry() invoked!');
   addPkgEntryDialog.close();
 }

 function validateName(name, fieldValues) {
   // console.log(`XX ViewPkg: validateName('${name}') invoked!`, {name, fieldValues});
   let nameErr = '';
   if (!name) {
     nameErr = 'Name is required';
   }
   else if (name.length < 3) {
     nameErr = 'Name must be at least 3 characters';
   }
   else if (name === 'dup') {
     nameErr = 'Name must be unique (within this package)';
   }
   return nameErr;
 }

 function validateId(id, fieldValues) {
   // console.log(`XX ViewPkg: validateId('${id}') invoked!`, {id, fieldValues});
   let idErr = '';

   if (pkgEntryType !== 'Directory') { // id NOT needed for directories ?# may NOT need this check when we dynamically remove our structure
     if (!id) {
       idErr = 'ID is required';
     }
     else if (id.length < 2) {
       idErr = 'ID must be at least 2 characters';
     }
     else if (id === 'dup') {
       idErr = 'ID must be unique (within this package)';
     }
   }
   return idErr;
 }
</script>

<Dialog bind:this={addPkgEntryDialog} title="Add Package Entry ({pkg.getPkgName()})">

  <form use:formCheckerAction>

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
          <input use:nameCheckerAction
                 type="text">
          <FieldErr fieldChecker={nameChecker}/>
        </td>
      </tr>

      <!-- ID (un-needed for directories)  -->
      {#if pkgEntryType !== 'Directory'}
        <tr transition:fade>
          <th><label for="id">ID:</label></th>
          <td>
            <input use:idCheckerAction
                   type="text">
            <FieldErr fieldChecker={idChecker}/>
          </td>
        </tr>
      {/if}

    </table>

    <hr/>

    <!-- form error message -->
    <center>
      <FormErr {formChecker}/>
    </center>

    <!-- control buttons -->
    <center>
      <input type="submit" value="Add">
      <button on:click|preventDefault={addPkgEntryDialog.close}>Cancel</button>
    </center>

  </form>

</Dialog>

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
