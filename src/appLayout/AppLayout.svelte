<script context="module">
 import LeftNav  from './LeftNav.svelte';
 import verify   from '../util/verify';

 // DESC: <AppLayout> provides the layout of visualize-it.
 //       It is a "singleton" UI Component, instantiated one time in the app root.

 // NOTE: vars prefixed with underbar ("_"):
 //       - represent component instance state of the one-and-only <AppLayout> instance
 //       - are initialized through life-cycle-hooks (e.g. onMount())
 //       - are indirectly used for public promotion to the outside world

 let _leftNavComp; // ... our one-and-only <LeftNav/> component instance
 const activateSingleton = (leftNavComp) => {
   // verify singleton restriction
   verify(!isActive(), 'only ONE <AppLayout/> component should be instantated (at the app root)');

   // register component binding
   _leftNavComp = leftNavComp;

   // process any prior cached requests
   if (cachedLeftNavComps.length) {
     cachedLeftNavComps.forEach( (comp) => registerLeftNavEntry(comp));
     cachedLeftNavComps = [];
   }
 };
 const deactivateSingleton = () => _leftNavComp = null;
 const isActive            = () => _leftNavComp ? true : false;

 //***
 //*** PUBLIC API
 //***

 let cachedLeftNavComps = [];

 // + registerLeftNavEntry(comp): void ... dynamically add supplied component entry to LeftNav
 export function registerLeftNavEntry(comp) {
   // process request ... when we are active
   if (isActive()) {
     _leftNavComp.registerLeftNavEntry(comp);
   }
   // cache requests ... when we are inactive
   else {
     cachedLeftNavComps.push(comp);
   }
 }
</script>


<script>
 import Drawer, {AppContent} from '@smui/drawer';
 import TopAppBar, {Row, Section, Title as AppBarTitle} from '@smui/top-app-bar';
 import IconButton   from '@smui/icon-button';
 import ToolBar      from './ToolBar.svelte';
 import {toast}      from '../util/ui/notify';
 import {onMount}    from 'svelte';
 import {PkgEntryTabs, 
         activeTab}  from '../pkgEntryTabs';

 // maintain our reflexive in-sync label qualifier
 // ... for PkgEntries, we utilize it's changeManager reflexive store
 //     NOTE: getTabContext() isA PkgEntry ONLY for TabControllerPkgEntry type
 //           ... otherwize the .changeManager will be undefined (which works for us)
 $: changeManager = $activeTab    ? $activeTab.getTabContext().changeManager : null;
 $: inSyncQual    = changeManager ? $changeManager.inSyncLabelQualifier      : '';

 // App Title ... either "Visualize It" or the Pkg Name of the active tab
 $: appTitle = $activeTab ? $activeTab.getTabQualifyingDesc() + inSyncQual : 'Visualize It';

 // maintain our external bindings (once <AppLayout> is mounted)
 let leftNavComp; // ... maintained by `bind:this` (see below)
 onMount(() => {
   activateSingleton(leftNavComp);
   return deactivateSingleton;
 });

 // toggle Drawer (LeftNav) open/closed
 let drawerOpen = true;
 function toggleDrawer() {
   drawerOpen = !drawerOpen;
 }
</script>


<!-- top-level page container ... manages 1. vit-page-app-bar and 2: vit-page-content -->
<div class="vit-page-container">

  <!-- top-level page app-bar -->
  <div class="vit-page-app-bar">
  <TopAppBar variant="static" dense color="secondary">
    <Row>
      <Section>
        <IconButton class="material-icons" title="Toggle Left Nav Package View" on:click={toggleDrawer}>menu</IconButton>
        <AppBarTitle>{appTitle}</AppBarTitle>
      </Section>
      <ToolBar/>
    </Row>
  </TopAppBar>
  </div>

  <!-- vit-page-content:     everything MINUS vit-page-app-bar -->
  <!-- vit-drawer-container: manages 1. vit-drawer 2: vit-drawer-app-content -->
  <div class="vit-page-content vit-drawer-container">

    <!-- vit-drawer (LeftNav) -->
    <Drawer class="vit-drawer" variant="dismissible" bind:open={drawerOpen}>
      <!-- farm this out to our LeftNav feature -->
      <LeftNav bind:this={leftNavComp}/>
    </Drawer>

    <!-- vit-drawer-app-content: everything MINUS vit-drawer -->
    <!-- vit-tabs-container:     flex container for util/ui/tabManager/Tabs (really TabEntry/TabPanel) -->
    <AppContent class="vit-drawer-app-content vit-tabs-container">
      <!-- our dynamic Pkgentry tabs -->
      <PkgEntryTabs/>
    </AppContent>
  </div>
</div>


<style>
 /* NOTE: clarification of the usage of: :global() -and- universal selector (*)

    - example:
  * :global(.vit-drawer-app-content) {
    ... rules (snip snip)
    }

    - :global()

    This is a Svelte feature that allows you to apply styles to a
    selector globally.

    In the example (above) it applies to ALL elements with class
    vit-drawer-app-content, in any component that are decendants of
    any element belonging to this component.

    AI: I don't fully understand this, but without this in some
    cases (as the one above), the generated css doesn't show up.

    - descendant combinator using the universal selector (*) 

    This is simply providing a "more specific" rule that overrides
    the implicit mdc classes injected by the @smui UI Kit.

    In the example above the implicit .mdc-drawer-app-content
    (injected by the @smui UI Kit) takes precidence WITHOUT the
    descendant combinator.  With it, it has the effect of making the
    rule more "important"!

    I believe this is due to a combination of Svelte heuristics -and-
    the @smui UI Kit I am using.
  */

 /* top-level page container ... manages 1. vit-page-app-bar and 2: vit-page-content */
 .vit-page-container {
   /* baseline our size to fill the entire page (i.e. the browser window) */
   width:          100%;
   height:         100%;

   /* flex container characteristics: */
   display:        flex; /* AI: flex seems to work just as well as: inline-flex */
   flex-direction: column;
   flex-wrap:      nowrap;
   align-items:    stretch;
 }

 /* top-level page app-bar */
 /* AI: NOT really needed: currently all characteristics are coming from @smui <TopAppBar> */
 * :global(.vit-page-app-bar) {
   /* flex item characteristics: */
   flex-grow:  0;

   /* color: red; /* xx diagnostic */
 }

 /* vit-page-content: everything MINUS vit-page-app-bar */
 .vit-page-content {

   /* flex item characteristics: */
   flex-grow:  1;  /* fill out to all space */

   overflow:   auto; /* inject scroll-bars at this level */

   /* NOTE: flex container characteristics for our <Drawer> (LeftNav)
      is supplied via a seperate class: vit-drawer-container */

   /* general characteristics: */
   /* background-color: lightgrey; /* diagnostic */
 }

 /* vit-drawer-container: manages 1. vit-drawer 2: vit-drawer-app-content */
 .vit-drawer-container {
   /* flex container characteristics: */
   display:        flex; /* AI: flex seems to work just as well as: inline-flex */
   flex-direction: row;
   flex-wrap:      nowrap;
   align-items:    stretch;

   position: relative; /* REQUIRED (for Drawer): WEIRD: without this causes: browser scroll bar the height of <TopAppBar> */
   /* z-index:  0;        /* doesn't appear to be needed - suspect Drawer related for modal only */
 }

 /* vit-drawer (LeftNav) */
 /* AI: NOT really needed: currently all characteristics are coming from @smui <Drawer> */
 * :global(.vit-drawer) {
   /* color: red; /* xx diagnostic */
 }

 /* vit-drawer-app-content: everything MINUS vit-drawer */
 * :global(.vit-drawer-app-content) {

   /* flex item characteristics: */
   flex-grow: 1;    /* fill out to all space */
   overflow:  auto; /* inject scroll-bars at this level ... without it, scrolls BOTH vit-drawer and vit-drawer-app-content */

   /* background-color: pink; /* diagnostic */
   /* color:            red;  /* diagnostic */
 }

 /* vit-tabs-container: flex container for util/ui/tabManager/Tabs (really TabEntry/TabPanel) */
 :global(.vit-tabs-container) {
   /* flex container characteristics: */
   display:        flex;
   flex-direction: column;
   flex-wrap:      nowrap;
   align-items:    stretch;
 }

</style>
