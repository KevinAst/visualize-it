<script>
 import verify from '../util/verify';

 // component params
 export let tab;    // ... TabController
 export let active; // ... boolean

 // validate supplied parameters
 const check = verify.prefix('<TabPanel> parameter violation: ');
 // ... tab
 check(tab,               'tab is required');
 check(tab.getTabContext, `tab must be a TabController ... NOT: ${tab}`);
 // ... active
 check(active===true||active===false, `active must be a boolean ... NOT: ${active}`);
</script>


<!-- .vit-tabs-content: everything MINUS vit-tabs-bar -->
<!-- .main-content:     our application payload! -->
<main class="vit-tabs-content main-content" style="display: {active ? 'block' : 'none'};">
  <svelte:component this={tab.getTabPanel().Comp} {...tab.getTabPanel().props}/>
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
 }
</style>
