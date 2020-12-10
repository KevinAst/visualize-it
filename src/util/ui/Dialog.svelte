<script>
 import {createEventDispatcher, 
         tick}   from 'svelte';
 import {fade}   from 'svelte/transition';
 import Icon     from './Icon.svelte';

 // INPUT: title text of the dialog header
 export let title;

 // INPUT: optional title icon, placed just befor the title (a material icon name)
 export let titleIcon = 'NONE';

 // INPUT: should header promote a close control in the title (boolean)
 export let canClose = true;
 const closeIconName = 'highlight_off';

 // INPUT: optional svelte/transition DEFAULT: fade, TURN OFF: unsure how
 export let transition    = fade;
 export let transitionOps = {duration: 500};

 // OUTPUT: A `show` event is dispatched whenever the dialog is displayed.
 //         Parents can optionally listen for this event as follows:
 //         EX: <dialog on:show={() => doSomething()} ...>

 // OUTPUT: A `close` event is dispatched whenever the dialog is closed.
 //         Parents can optionally listen for this event as follows:
 //         EX: <dialog on:close={() => doSomething()} ...>

 // <dialog> internal binding
 let dialog;

 // <dialog> visibility state
 // NOTE: <dialog> natively supports visibility
 //       HOWEVER: we layer this on top of <dialog> in support of Svelte's transition animation
 //                which requires DOM add/remove
 let dialogVisible = false;

 // our value-added show(), showModal(), and close()
 //  - fronting the <dialog> API
 //  - maintaining our own internal state
 //  - managing our value-added events
 export async function show() {
   if (dialogVisible)    // no-op if dialog is already open
     return;
   dialogVisible = true; // maintain our internal state
   await tick();         // waits for dialog to be instantiated
   dialog.show();        // front the <dialog> API
   dispatch('show');     // promote our value-added "show" event
 }
 export async function showModal() {
   if (dialogVisible)    // no-op if dialog is already open
     return;
   dialogVisible = true; // maintain our internal state
   await tick();         // waits for dialog to be instantiated
   dialog.showModal();   // front the <dialog> API
   dispatch('show');     // promote our value-added "show" event
 }
 export function close() {
   if (!dialogVisible)    // no-op if dialog is closed
     return;
   dialogVisible = false; // maintain our internal state
// await tick();          // waits for dialog to be removed (showing our reverse animation) ..... NO WORK: (presumably because dialog is taken down immediatly)
   setTimeout( () => {
     dialog.close();      // front the <dialog> API (in timeout, showing our reverse animation) ... WORKS: (a bit hacky)
   }, 500);
   dispatch('close');     // promote our value-added "close" event
 }
 const dispatch = createEventDispatcher();
</script>

{#if dialogVisible}
  <dialog bind:this={dialog}
          transition:transition={transitionOps}>
    <header>
      <Icon name={titleIcon}/>
      <div class="title">{title}</div>
      {#if canClose}
        <Icon name={closeIconName}
              on:click={close}
              style="cursor: pointer;"
              title="Close Dialog"/>
      {/if}
    </header>
    <main>
      <slot/>
    </main>
  </dialog>
{/if}

<style>
 dialog {
   /* The following properties center the dialog in the browser window.
      NOTE: Technically this is NOT needed because dialogs are positioned in center by default.
            HOWEVER, native centering has some issues where modals are dropped down a bit.
            By enabling these directives, all dialogs will be fully centered,
            BUT it causes some "jumping" at the end of animations :-( */
/* position: fixed;               /* positioned elm (required for below) */
/* top: 50%;                      /* top of dialog is 50% of window*/
/* transform: translate(0, -50%); /* moves the  dialog UP by 50% of the dialog  height ... now centered*/

   border:     none;
   box-shadow: 0 0 20px black; /* offset-x | offset-y | blur-radius | color */
   padding:    0;
 }

 header {
   display:         flex;
   justify-content: space-between;
   align-items:     center;

   background-color: DimGray;
   color:            white;
   font-weight:      bold;
   font-size:        80%;

   box-sizing:  border-box;
   padding:     5px;
   width:       100%;
 }

 .title {
   flex-grow:    1; /* grow title, forcing the "meta" close to be right justified */
   margin-right: 10px;
 }

 main {
   padding: 5px;
 }

 /* for modal dialogs: adjust the window backdrop to a transparent shade of gray */
 dialog::backdrop {
   background: rgba(0, 0, 0, 70%);
 }
</style>
