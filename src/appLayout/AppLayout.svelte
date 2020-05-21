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
 const activate = (leftNavComp) => {
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
 const deactivate = () => _leftNavComp = null;
 const isActive   = () => _leftNavComp ? true : false;

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
 import {toast}   from '../util/notify';
 import {onMount} from 'svelte';

 let leftNavComp; // maintained by `bind:this` (see below)

 // maintain our external bindings (when <AppLayout> is mounted)
 onMount(() => activate(leftNavComp), deactivate);


 //  ?? CLEANUP POINT ********************************************************************************
 import Button /*, {Label} */ from '@smui/button';

 import Drawer, {AppContent, Content, Header, Title, Subtitle} from '@smui/drawer';
 import H6 from '@smui/common/H6.svelte';
 
 let myDrawerRef; // AI: not needed in this example
 let myDrawerOpen = true;
 let activeTxt       = 'WowZee';

 function toggleDrawer() {
   myDrawerOpen = !myDrawerOpen;
 }

 function setActiveTxt(value) {
    activeTxt = value;
  }

 // AI: App Bar ... merge together
 import TopAppBar, {Row, Section, Title as AppBarTitle} from '@smui/top-app-bar';
 import IconButton from '@smui/icon-button';


 // AI: Tabs ... merge together
 import Tab, {Label} from '@smui/tab';
 import TabBar from '@smui/tab-bar';

// import './theme/_smui-theme.scss'; // THEME:?? shot in the dark
</script>


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

 /* vit-tabs-container: manages 1. vit-tabs-bar 2: vit-tabs-content */
 :global(.vit-tabs-container) {
   /* flex container characteristics: */
   display:        flex;
   flex-direction: column;
   flex-wrap:      nowrap;
   align-items:    stretch;
 }

 /* vit-tabs-bar (TabBar> */
 .vit-tabs-bar {
   /* NOTE: currently all charistics are coming from @smui <TabBar> */
 }

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



<!-- top-level page container ... manages 1. vit-page-app-bar and 2: vit-page-content -->
<div class="vit-page-container">

  <!-- top-level page app-bar -->
  <div class="vit-page-app-bar">
  <TopAppBar variant="static" dense color="secondary">
    <!-- ??$$ farm this out to some AppBar -->
    <Row>
      <Section>
        <IconButton class="material-icons" on:click={toggleDrawer}>menu</IconButton>
        <AppBarTitle>Visualize It</AppBarTitle>
      </Section>
      <Section align="end" toolbar>
        <IconButton class="material-icons" aria-label="Download">file_download</IconButton>
        <IconButton class="material-icons" aria-label="Print this page">print</IconButton>
        <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
      </Section>
    </Row>
  </TopAppBar>
  </div>

  <!-- vit-page-content:     everything MINUS vit-page-app-bar -->
  <!-- vit-drawer-container: manages 1. vit-drawer 2: vit-drawer-app-content -->
  <div class="vit-page-content vit-drawer-container">

    <!-- vit-drawer (LeftNav) -->
    <Drawer class="vit-drawer" variant="dismissible" bind:this={myDrawerRef} bind:open={myDrawerOpen}>
      <!-- ??$$$ farm this out to some LeftNav -->
      <LeftNav bind:this={leftNavComp}/>
    </Drawer>

    <!-- vit-drawer-app-content: everything MINUS vit-drawer -->
    <!-- vit-tabs-container: manages 1. vit-tabs-bar 2: vit-tabs-content -->
    <AppContent class="vit-drawer-app-content vit-tabs-container">

      <!-- ??$$ farm this out to some TabManager -->
      <!-- vit-tabs-bar <TabBar> -->
      <div class="vit-tabs-bar">
        <TabBar tabs={[...Array(20)].map((v, i) => i + 1)} let:tab>
          <Tab {tab}>
            <Label>Tab {tab}</Label>
          </Tab>
        </TabBar>
      </div>

      <!-- .vit-tabs-content: everything MINUS vit-tabs-bar -->
      <!-- .main-content:     our application payload! -->
      <main class="vit-tabs-content main-content">
        <pre>Active: {activeTxt}</pre>

        <p class="mdc-typography--subtitle2">Here are some Typography fonts:</p>
        <ul>
          <p class="mdc-typography--caption">Caption</p>
          <p class="mdc-typography--button">Button</p>

          <Button variant="raised" color="primary" on:click={() => toast({
            msg: 'WowZee Toast\nLine 2\n      Line 3 with pre-space\nHere is a really big line.  I hope it works ... now is the time for every good man to come to the aid of his country.',
            actions: [
              {
                txt:    'WowZee',
                action: () => toast({msg: 'WowZee WowZee WooWoo!!'}),
              },
              {
                txt:    'Error',
                action: () => {throw new Error('Here is a run-time error from somewhere')},
              },
              {
                txt:    'OK'
              },
            ],
            })}>
            <Label>Do a Toast</Label>
          </Button>
          <p class="mdc-typography--body1">
            <small>small</small>
            <big>big</big>
            <sup>sup</sup>
            <sub>sub</sub>
            <strong>strong</strong>
            <em>em</em>
          </p>
        </ul>

        <p class="mdc-typography--subtitle2">
          This is our tab content ... I hope it works ... here we go!!
        </p>
        <pre>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu nisl
nunc mi ipsum faucibus vitae aliquet. Magna ac placerat vestibulum
lectus mauris ultrices eros in cursus. Quam elementum pulvinar etiam
non. Donec massa sapien faucibus et. Lorem ipsum dolor sit
amet. Convallis posuere morbi leo urna molestie at elementum eu
facilisis. Donec pretium vulputate sapien nec sagittis aliquam
malesuada bibendum arcu. Libero justo laoreet sit amet cursus sit amet
dictum sit. Urna molestie at elementum eu facilisis sed odio
morbi. Commodo ullamcorper a lacus vestibulum sed arcu non
odio. Aliquet sagittis id consectetur purus ut faucibus pulvinar
elementum integer.

Massa ultricies mi quis hendrerit dolor magna eget est. Sit amet
cursus sit amet dictum sit amet. Lacus sed viverra tellus in hac
habitasse platea dictumst vestibulum. Donec pretium vulputate sapien
nec sagittis aliquam. Tristique senectus et netus et malesuada
fames. Nulla facilisi cras fermentum odio eu feugiat. Eu mi bibendum
neque egestas congue quisque egestas. Iaculis at erat pellentesque
adipiscing commodo elit at imperdiet. Odio ut sem nulla pharetra diam
sit amet nisl. Sed turpis tincidunt id aliquet risus feugiat in
ante. Diam vulputate ut pharetra sit amet aliquam id. Quisque non
tellus orci ac auctor augue. Purus sit amet volutpat consequat mauris
nunc congue nisi. Nisl purus in mollis nunc sed id. Velit scelerisque
in dictum non consectetur a erat. Lacus luctus accumsan tortor posuere
ac.
        </pre>

      </main>

    </AppContent>
  </div>
</div>
