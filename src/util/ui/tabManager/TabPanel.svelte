<script>
 // accept component props
 export let tab;        // ... the TabController we are displaying
 export let isActive;   // ... boolean indicator as to whether self is active or not

 // validate component props
 // ... because this is an internal component, we bypass this step :-)

 // extract needed items out of our tab
 const {Comp, props} = tab.getTabPanel();
</script>


<!-- .main-content: our payload! -->
<main class="main-content" style="display: {isActive ? 'block' : 'none'};">
  <svelte:component this={Comp} {...props}/>
</main>


<style>
 /* main-content: our payload! */
 .main-content {
   /* flex item characteristics: */
   flex-grow:  1;  /* fill out to all space (taken from old vit-tabs-content, however doesn't appear to be needed ... keep for now) */
   overflow: auto; /* KEY: provide scroll bars within main-content only (without this, will scroll tabs too) */

   /* general characteristics: */
   box-sizing: border-box; /* VERY KOOL: account for border/padding in specified width/height */
   padding:    16px;       /* nicety */

   background-color: #ececec;            /* THEME: $mdc-theme-background NOT (just a little darker) */
   border:           2px solid #26a69a;  /* THEME: $mdc-theme-primary */
 }
</style>
