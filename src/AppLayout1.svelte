<script>
// SNAPSHOT: AppBar working

  import Drawer, {AppContent, Content, Header, Title, Subtitle} from '@smui/drawer';
//import Button, {Label} from '@smui/button';
  import List, {Item, Text, Graphic, Separator, Subheader} from '@smui/list';
  import H6 from '@smui/common/H6.svelte';

  let myDrawerRef; // ?? not needed in this example
  let myDrawerOpen = true;
  let activeTxt       = 'WowZee';

  function setActiveTxt(value) {
    activeTxt = value;
    //myDrawerOpen = false;
  }


 // ??$$ App Bar ... merge together
 import TopAppBar, {Row, Section, Title as AppBarTitle} from '@smui/top-app-bar';
 import IconButton from '@smui/icon-button';

 // ??$$ hard-code to what we want
 const prominent = false;
 const dense = false;
 const secondaryColor = false;

</script>


<style>
  .drawer-container {
    position: relative;
    display: flex;
    height: 350px; /* 100% ?? 350px; */
    width:  100%; /* ?? max-width: 600px; */
 /* border: 1px solid rgba(0,0,0,.1); KJB: border causes scroll bars IF NO padding in public/global.css */
    overflow: hidden;
    z-index: 0;
  }

 /* ?? used WHERE? */
 * :global(.mdc-drawer--modal, .mdc-drawer-scrim) {
   /* This is not needed for a page-wide modal. */
   position: absolute;
 }

 /* ?? why need global AND why universal selector (*) */
 * :global(.app-content) {
   flex: auto;
   overflow: auto;
   position: relative;
   flex-grow: 1;
   background-color: pink;  /* ?? diagnostic */
   color:            blue;  /* ?? diagnostic */
 }

 .main-content {
   overflow: auto;
   padding: 16px;
   height: 100%;
   box-sizing: border-box;
/* border: 5px solid black; /* ?? KJB test */
 }

 /* ?? KJB TEST */
 .drawer {
   width: 200px; /* ?? no work  */
 }


 /* ??$$ App Bar ... merge together */

 /* top-level app container ... manages 1. <TopAppBar> and 2: app-content */
 .app-container {/* ?? was named top-app-bar-container (from temp.top-app-bar.svelte) */
   /* flex container characteristics: */
   display:        inline-flex; /* ?? flex seems to work just as well */
   flex-direction: column;
   width:          100%;
   height:         100%;
   overflow:       auto;  /* ?? unsure about this (I want this content to be fixed -AND- let our tab content to scroll)  */
 }

 /* app-content: everything EXCEPT  <TopAppBar> */
 .app-content { /* ?? was named flexor-content (from temp.top-app-bar.svelte) */

   /* flex item characteristics: */
   flex-basis: 0; /* ?? appears to NOT be needed */
   flex-grow:  1;
/* height:     0;  /* ?? appears to NOT be needed ... original was 0 */
   overflow:   auto;  /* ?? unsure about this (I want this content to be fixed -AND- let our tab content to scroll)  */

   /* flex container characteristics: */
   /* ??? */


   /* general characteristics: */
   background-color: lightgrey; /* ?? KJB: diagnostic */
 }
 


</style>

<!-- ??$$ App Bar ... merge together   -->
<div class="app-container">
  <TopAppBar variant="static" {prominent} {dense} color={secondaryColor ? 'secondary' : 'primary'}>
    <Row>
      <Section>
        <IconButton class="material-icons">menu</IconButton>
        <AppBarTitle>Visualize It</AppBarTitle>
      </Section>
      <Section align="end" toolbar>
        <IconButton class="material-icons" aria-label="Download">file_download</IconButton>
        <IconButton class="material-icons" aria-label="Print this page">print</IconButton>
        <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
      </Section>
    </Row>
  </TopAppBar>
  <div class="app-content">
    <pre>
      This is the app bar content.
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
  </div>
</div>

<!-- ??
<div class="drawer-container">
  <Drawer class="drawer" variant="dismissible" bind:this={myDrawerRef} bind:open={myDrawerOpen}>
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
      <p on:click={() => myDrawerOpen = !myDrawerOpen}>Toggle Drawer</p>
      <br/>
      <pre class="status">Active: {activeTxt}</pre>
    </main>
  </AppContent>
</div>
-->
