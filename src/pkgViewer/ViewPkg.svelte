<script>
 // ?? ?#: further refinement for Phase II
 import List, {Item, Meta, Text, Separator} from '@smui/list';
 import {fade}          from 'svelte/transition';
 import Menu            from '@smui/menu';
 import Icon            from '../util/ui/Icon.svelte';
 import verify          from '../util/verify';
 import {isPkg}         from '../util/typeCheck';
 import {toast}         from '../util/ui/notify';
 import discloseError   from '../util/discloseError';
 import Dialog          from '../util/ui/Dialog.svelte';
 import {FormChecker,
         FieldChecker,
         FieldErr,
         FormErr}       from '../util/ui/FormChecker';
 import ViewPkgTree     from './ViewPkgTree.svelte';
 import DispMode        from '../core/DispMode';
 import {savePkg as savePkgService} from '../core/pkgPersist';

 // component parameters
 export let pkg;

 // validate supplied parameters
 const check = verify.prefix('<ViewPkg> parameter violation: ');
 // ... pkg
 check(pkg,        'pkg is required');
 check(isPkg(pkg), `pkg must be a SmartPkg ... NOT: ${pkg}`);

 // diagnostic showing entire tree
 // $: console.log(`XX <ViewPkg> rendering "enhanced" ${pkg.toString('tree')}`);

 // maintain our reflexive expansion state
 let expanded = true;
 $: expandedIndicator = expanded ? '' : '...';

 // maintain our reflexive in-sync qualifiers
 const changeManager = pkg.changeManager;
 $: inSyncIcon       = $changeManager.inSyncIcon();
 $: pkgNameToolTip   = `Package: ${pkg.getPkgId()}` + ($changeManager.inSync ? '' : ' (modified - needs to be saved)');

 // our context menu binding
 let menu;

 // save our SmartPkg to an external resource (ex: web or local file)
 async function savePkg(saveAs=false) { // saveAs - true: save in a newly user selected file, false: save in the original pkg's `pkgResourcePath`
   try {
     // insure the package is a candidate for saving
     if (!pkg.canPersist()) {
       toast({msg: `The "${pkg.getPkgName()}" package cannot be saved ... it contains code, which cannot be persisted!`});
       return;
     }

     // save the package
     const result = await savePkgService(pkg, saveAs);
     if (result === 'UserCancel') {
     }
     else if (result === 'SaveNotNeeded') {
       toast({msg: `The "${pkg.getName()}" package does NOT need to be saved ... you must first apply some changes`});
     }
     else {
       toast({msg: `The "${pkg.getPkgName()}" package has been saved!`});
     }
   }
   catch(err) {
     // gracefully report unexpected conditions to user
     discloseError({err, logIt:true});
   }
 }

 // our edit/view status ... a boolean
 $: inEditMode = pkg.getDispMode() === DispMode.edit; // true: edit package structure, false: package is read-only
 $: style      = inEditMode ? 'color: blue;' : '';
 $: undoAvail  = $changeManager.undoAvail;
 $: redoAvail  = $changeManager.redoAvail;

 // edit the structure of our SmartPkg (EPkg name/id, add/remove PkgEntry, dir structure, etc.)
 // ... changes the visual rendering to accomidate edits
 function editPkg() {
   // insure our pkg can be saved before we allow it to be edited
   if (!pkg.canPersist()) {
     toast({msg: `The "${pkg.getName()}" package cannot be edited ` + 
                 `because it contains code ... therefore you would not be able to save your changes.`});
     return;
   }
   // enable the edit mode
   changeManager.changeDispMode(DispMode.edit);
   pkg = pkg; // ... make responsive to Svelte
   // toast({msg: `The "${pkg.getPkgName()}" package structure can now be edited (add/remove/reposition entries/directories, name/id changes, etc.)`});
 }

 // complete the edit operation of our SmartPkg (EPkg name/id, add/remove PkgEntry, dir structure, etc.)
 // ... reverting back to the "normal" usage mode (DispMode.view)
 function editPkgComplete() {
   changeManager.changeDispMode(DispMode.view);
   pkg = pkg; // ... make responsive to Svelte
   // toast({msg: `The "${pkg.getPkgName()}" package structure is now in a view mode (edits are disabled)`});
 }

 // register our package structure GUI synchronization process (invoked via changeManager)
 pkg.syncPkgStructureGuiChanges = syncPkgStructureGuiChanges;
 function syncPkgStructureGuiChanges() {
   pkg = pkg; // ... make responsive to Svelte
 }

 // in support of "Add Package Entry"
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

<!-- NOTE: using activated strictly for it's coloring :-) -->
<Item class="vit-drawer-item"
      activated
      on:SMUI:action={() => expanded = !expanded}
      title={pkgNameToolTip}>
  <Icon name="{pkg.getIconName()}"
        {style}
        size="1.0rem"/>
  <Text {style}>
    {pkg.getPkgName()}
    {expandedIndicator}
  </Text>
  <Icon name={inSyncIcon}
        title="Package has been modified (needs to be saved) NOT SHOWING (qualified in pkgNameToolTip)"
        size="1.0rem"/>
  <Meta>
    <Icon name="save"
          title="Save Package"
          on:click={(e) => {e.stopPropagation(); savePkg();} }/>

    {#if inEditMode} <!-- for edit mode -->
      <Icon name="check"
            title="Complete Package Edit"
            on:click={(e) => {e.stopPropagation(); editPkgComplete();} }/>
    {:else} <!-- for view mode -->
      <Icon name="edit"
            title="Edit Package Structure"
            on:click={(e) => {e.stopPropagation(); editPkg();} }/>
    {/if}

    <Icon name="more_vert"
          title="Manage Package"
          on:click={(e) => {e.stopPropagation(); menu.setOpen(true);} }/>
  </Meta>
</Item>

<span>
  <Menu bind:this={menu}>
    <List>
      <Item on:SMUI:action={() => savePkg()}>    <Text>Save {pkg.getPkgName()}</Text></Item>
      <Item on:SMUI:action={() => savePkg(true)}><Text>Save As ...</Text></Item>
      <Separator/>
      {#if inEditMode} <!-- for edit mode -->
        <Item on:SMUI:action={addPkgEntryDialog.showModal}><Text>Add Package Entry</Text></Item>
        <Item on:SMUI:action={editPkgComplete}><Text>Complete Package Edit</Text></Item>
        <Item on:SMUI:action={() => changeManager.applyUndo()} disabled={!undoAvail}><Text>Undo</Text></Item>
        <Item on:SMUI:action={() => changeManager.applyRedo()} disabled={!redoAvail}><Text>Redo</Text></Item>
      {:else} <!-- for view mode -->
        <Item on:SMUI:action={editPkg}><Text>Edit Package Structure</Text></Item>
      {/if}
      <Separator/>
      <Item on:SMUI:action={() => alert('FUTURE: Close')}><Text>Close</Text></Item>
    </List>
  </Menu>
</span>

{#if expanded}
  <ViewPkgTree pkgTree={pkg.rootDir}/>
{/if}

<!-- Dialog in support of Add Package Entry -->
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
    <FormErr {formChecker}/>

    <!-- control buttons -->
    <center>
      <input type="submit" value="Add">
      <button on:click|preventDefault={addPkgEntryDialog.close}>Cancel</button>
    </center>

  </form>

</Dialog>


<style>
 /* vit-drawer-item: attempt to space out <ViewPkgTree> content a bit better */
 * :global(.vit-drawer-item) {
   margin: 8px 8px 0px 8px !important;
 }

 /* ?? dialog related styling */
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
