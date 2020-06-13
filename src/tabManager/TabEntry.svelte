<script>
 import verify             from '../util/verify';
 import Tab, {Label, Icon} from '@smui/tab';

 import Menu                          from '@smui/menu';
 import List, {Item, Text, Separator} from '@smui/list';
 import {Anchor}                      from '@smui/menu-surface';

 import {createLogger} from '../util/logger';

 // our internal diagnostic logger (normally disabled, but keep enabled for a while)
 const log = createLogger('***DIAG*** <TabEntry> ... ').enable();

 // component params
 export let tab; // ... TabController

 let menu;
 let menuAnchor;

 // validate supplied parameters
 const check = verify.prefix('<TabEntry> parameter violation: ');
 // ... tab
 check(tab,               'tab is required');
 check(tab.getTabContext, `tab must be a TabController ... NOT: ${tab}`);
</script>

<!-- ?? use:Anchor ONLY works for content WITHIN this div  -->
<div use:Anchor bind:this={menuAnchor}>
  <Tab {tab}
       minWidth
       on:contextmenu={(e)=> {
                      e.preventDefault(); // prevent context menu of native browser from displaying
                      log('?? context menu, e: ', {e, tab});
                      // debugger;
                      menu.setOpen(true);
                      }}>
    <Label>
      {tab.getTabName()}
    </Label>
    <!-- use tab-indicator slot to highlight ACTIVE TAB (NONE with &nbsp;) however places bar on top WHEN sized correctly (which some may like)
    <span slot="tab-indicator">&nbsp;</span>
    -->

    <!-- ?? TRY 2: more overlay (overlayed by both ?? and TabPanel) BUT anchor IS honored (presumably because is within anchor div)  ... anchorCorner="BOTTOM_LEFT" ... if we can get TabPanel to NOT obsecure, BOTTOM_LEFT would work
    <Menu bind:this={menu} anchor={false} bind:anchorElement={menuAnchor}>
      <List>
        <Item on:SMUI:action={() => log('Close')}><Text>Close</Text></Item>
        <Item on:SMUI:action={() => log('Close Others')}><Text>Close Others</Text></Item>
        <Item on:SMUI:action={() => log('Close to Right')}><Text>Close to the Right</Text></Item>
        <Item on:SMUI:action={() => log('Close All')}><Text>Close All</Text></Item>
        <Separator />
        <Item on:SMUI:action={() => log('Reveal in Left Nav')}><Text>Reveal in Left Nav</Text></Item>
      </List>
    </Menu>
    -->

  </Tab>
</div>

<!-- NOTE: only way to activate close control on:click is by placing it outside of <Tab> :-( -->
<Icon class="material-icons close-icon" on:click={(e)=> log('?? closing tab', {e, tab})}>cancel_presentation</Icon>



<!-- ?? TRY 1: less overlay (still overlayed by TabPanel) BUT anchor NOT honored (presumably because not within anchor div)  ... anchorCorner="BOTTOM_LEFT" 
   -->
<Menu bind:this={menu} anchor={false} bind:anchorElement={menuAnchor}>
  <List>
    <Item on:SMUI:action={() => log('Close')}><Text>Close</Text></Item>
    <Item on:SMUI:action={() => log('Close Others')}><Text>Close Others</Text></Item>
    <Item on:SMUI:action={() => log('Close to Right')}><Text>Close to the Right</Text></Item>
    <Item on:SMUI:action={() => log('Close All')}><Text>Close All</Text></Item>
    <Separator />
    <Item on:SMUI:action={() => log('Reveal in Left Nav')}><Text>Reveal in Left Nav</Text></Item>
  </List>
</Menu>


<style>
 * :global(.mdc-menu-surface) {
/* z-index: 10000; /* ?? attempt to pevent popup menu from being covered up by other elements (was 8) */
 }
</style>

