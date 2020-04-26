<script>
 // SNAPSHOT: AppBar/LeftNav working ... a few open questions as to how something is working

  import Drawer, {AppContent, Content, Header, Title, Subtitle} from '@smui/drawer';
//import Button, {Label} from '@smui/button';
  import List, {Item, Text, Graphic, Separator, Subheader} from '@smui/list';
  import H6 from '@smui/common/H6.svelte';

  let myDrawerRef; // ?? not needed in this example
  let myDrawerOpen = true;
  let activeTxt       = 'WowZee';

  function toggleDrawer() {
    myDrawerOpen = !myDrawerOpen;
  }


 function setActiveTxt(value) {
    activeTxt = value;
  }

 // ??$$ App Bar ... merge together
 import TopAppBar, {Row, Section, Title as AppBarTitle} from '@smui/top-app-bar';
 import IconButton from '@smui/icon-button';

</script>



<style>

 /* ??$$ App Bar ... merge together */

 /* top-level app container ... manages 1. <TopAppBar> and 2: top-app-content */
 .top-app-container {/* ?? was named top-app-bar-container (from temp.top-app-bar.svelte) */
   /* flex container characteristics: */
   display:        inline-flex; /* ?? flex seems to work just as well */
   flex-direction: column;
   width:          100%;
   height:         100%;

/* overflow:       auto; /* ?? does NOT appear to be in-use  */
 }

 /* top-app-content: everything EXCEPT  <TopAppBar> */
 .top-app-content { /* ?? was named flexor-content (from temp.top-app-bar.svelte) */

   /* flex item characteristics: */
   flex-basis: 0; /* ?? appears to NOT be needed */
   flex-grow:  1;
/* height:     0;  /* ?? appears to NOT be needed ... original was 0 */

/* overflow:   auto; /* ?? does NOT appear to be in-use  */

   /* flex container characteristics: */
   /* ??? */


   /* general characteristics: */
   background-color: lightgrey; /* ?? KJB: diagnostic */
 }


 .drawer-container {
   /* flex container characteristics: */
   display:  flex;
   position: relative;
   height:   350px; /* 100% ?? 350px; */
   width:    100%; /* ?? max-width: 600px; */

/* overflow:   hidden; /* ?? does NOT appear to be in-use  */

   z-index: 0;       /* ?? */
 }

 /* this is not needed for a page-wide modal */
 /* ?? does NOT appear to be used for me
 * :global(.mdc-drawer--modal, .mdc-drawer-scrim) {
   position: absolute;
 }
 */


 /* ?? NEEDED, HOWEVER don't understand WHY following is needed:
       - :global
       - universal selector (*)
WORKS:
  * :global(.app-content) {

NO WORK:
  * .app-content {
  .top-app-content .app-content {
  */
 * :global(.app-content) {
   position: relative;
   flex-grow: 1;  /* fill out to all space ?? IN USE */
/* flex: auto;  /* ?? doesn't appear to need ... this shortcut is setting flex-grow to auto (conflicts with above) */

   overflow: auto; /* ?? IN USE (providing scroll bars restricted to app-content only) */

   background-color: pink;  /* ?? diagnostic */
   color:            blue;  /* ?? diagnostic */
 }

 .main-content {
/* overflow: auto; /* ?? does NOT appear to be in-use  */
   padding: 16px;
   height: 100%;
   box-sizing: border-box;
 /*border: 5px solid black; /* ?? diagnostic */
 }

</style>

<!-- top-level app container ... manages 1. <TopAppBar> and 2: top-app-content -->
<div class="top-app-container">

  <TopAppBar variant="static" dense color="primary">
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

  <!-- top-app-content: everything EXCEPT  <TopAppBar> -->
  <div class="top-app-content drawer-container">

    <Drawer variant="dismissible" bind:this={myDrawerRef} bind:open={myDrawerOpen}>
      <Header>
        <Title>Super Drawer</Title>
        <Subtitle>It's the best drawer.</Subtitle>
      </Header>
      <Content>
        <List>
          {#each ['WowZee', 'WooWoo', 'Poo', 'Pee', 'WomBee', 'WooLoo', 'I', 'Hope', 'This', 'Works'] as item}
          <Item on:click={() => setActiveTxt(item)} activated={activeTxt === item}>
            <Text>{item}</Text>
          </Item>
          {/each}
        </List>
      </Content>
    </Drawer>

    <AppContent class="app-content">
      <main class="main-content">
        <pre class="status">Active: {activeTxt}</pre>

        <pre>
          This is the app bar content ... I hope it works ... here we go ... don't be late!!
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
