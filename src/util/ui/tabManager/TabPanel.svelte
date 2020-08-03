<script>
 // accept component props
 export let tab;        // ... the TabController we are displaying
 export let isActive;   // ... boolean indicator as to whether self is active or not

 // validate component props
 // ... because this is an internal component, we bypass this step :-)

 // extract needed items out of our tab
 const {Comp, props} = tab.getTabPanel();
</script>


<!-- .vit-tabs-content: everything MINUS vit-tabs-bar -->
<!-- .main-content:     our application payload! -->
<main class="vit-tabs-content main-content" style="display: {isActive ? 'block' : 'none'};">
  <svelte:component this={Comp} {...props}/>
</main>


<style>
 /* .vit-tabs-content: everything MINUS vit-tabs-bar */
 * :global(.vit-tabs-content) {

   /* flex item characteristics: */
   flex-grow:  1;  /* fill out to all space */

   /* background-color: lightblue; /* diagnostic */
   /* color:            darkblue;  /* diagnostic */
 }

 /* main-content: our application payload! */
 .main-content {

   overflow: auto; /* provide scroll bars within main-content only ... without this, will scroll tabs too (BAD) */

   /* general characteristics: */
   box-sizing: border-box;       /* VERY KOOL: account for border/padding in specified width/height */
   padding:    16px;             /* nicety */
   /* border:     5px solid green;  /* diagnostic */
   /* background-color: lightgreen; /* diagnostic */
   /* color:            darkgreen;  /* diagnostic */

   background-color: #ececec; /* THEME:??  $mdc-theme-secondary-light; /* ?? shot in the dark */
   border:           2px solid #26a69a;  /* THEME:?? copied from theme */
   /* z-index: 1; /* ?? attempt to pevent popup menu from being covered up by other elements */
 }
</style>
