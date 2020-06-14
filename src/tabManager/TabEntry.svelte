<script>
 import verify             from '../util/verify';
 import Tab, {Label, Icon} from '@smui/tab';

 import Menu                          from '@smui/menu';
 import List, {Item, Text, Separator} from '@smui/list';

 import {createLogger} from '../util/logger';

 // our internal diagnostic logger (normally disabled, but keep enabled for a while)
 const log = createLogger('***DIAG*** <TabEntry> ... ').enable();

 // component params
 export let tab; // ... TabController

 let contextMenu;

 // validate supplied parameters
 const check = verify.prefix('<TabEntry> parameter violation: ');
 // ... tab
 check(tab,               'tab is required');
 check(tab.getTabContext, `tab must be a TabController ... NOT: ${tab}`);
</script>

<Tab {tab}
     minWidth
     on:contextmenu={(e)=> {
                    e.preventDefault(); // prevent context menu of native browser from displaying
                    log('context menu, e: ', {e, tab});
                    // debugger;
                    contextMenu.setOpen(true);
                    }}>
  <Label>
    {tab.getTabName()}
  </Label>
  <!-- use tab-indicator slot to highlight ACTIVE TAB (NONE with &nbsp;) however places bar on top WHEN sized correctly (which some may like)
  <span slot="tab-indicator">&nbsp;</span>
  -->
</Tab>

<!-- NOTE: only way to activate close control on:click is by placing it outside of <Tab> :-( -->
<Icon class="material-icons close-icon" on:click={(e)=> log('closing tab', {e, tab})}>cancel_presentation</Icon>

<!-- our context menu -->
<span>
  <Menu bind:this={contextMenu}>
    <List>
      <Item on:SMUI:action={() => log('Close')}><Text>Close</Text></Item>
      <Item on:SMUI:action={() => log('Close Others')}><Text>Close Others</Text></Item>
      <Item on:SMUI:action={() => log('Close to Right')}><Text>Close to the Right</Text></Item>
      <Item on:SMUI:action={() => log('Close All')}><Text>Close All</Text></Item>
      <Separator />
      <Item on:SMUI:action={() => log('Reveal in Left Nav')}><Text>Reveal in Left Nav</Text></Item>
    </List>
  </Menu>
</span>
