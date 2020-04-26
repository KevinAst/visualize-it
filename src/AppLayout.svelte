<script>
 import Drawer, {AppContent, Content, Header, Title, Subtitle} from '@smui/drawer';
 import List, {Item, Text, Graphic, Separator, Subheader} from '@smui/list';
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

 import './theme/_smui-theme.scss'; // THEME:?? shot in the dark

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
      <Header>
        <Title>Super Drawer</Title>
        <Subtitle>It's the best drawer.</Subtitle>
      </Header>
      <Content>
        <List>
          {#each ['WowZee', 'WooWoo', 'Poo', 'Pee', 'WomBee', 'WooLoo', 'I', 'Hope', 'This', 'Works', 'Here', 'We', 'GO!!'] as item}
          <Item on:click={() => setActiveTxt(item)} activated={activeTxt === item}>
            <Text>{item}</Text>
          </Item>
          {/each}
        </List>
      </Content>
    </Drawer>

    <!-- vit-drawer-app-content: everything MINUS vit-drawer -->
    <!-- vit-tabs-container: manages 1. vit-tabs-bar 2: vit-tabs-content -->
    <AppContent class="vit-drawer-app-content vit-tabs-container">

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

        <pre>
          This is our tab content ... I hope it works ... here we go ... don't be late!!
          Test 1
          Test 2
          Test 3
          Test 4
          Test 5
          Test 6
          Test 7
          Test 8
          Test 9
          Test 10
          Test 11
          Test 12
          Test 13
          Test 14
          Test 15
          Test 16
          Test 17
          Test 18
          Test 19
          Test 20
          Test 21
          Test 22
          Test 23
          Test 24
          Test 25
          Test 26
          Test 27
          Test 28
          Test 29
          Test 30
        </pre>

      </main>

    </AppContent>
  </div>
</div>
