<script>
 import Tab, {Label/*, Icon xx OLD*/}            from '@smui/tab';
 import Menu                          from '@smui/menu';
 import List, {Item, Text, Separator} from '@smui/list';

 import verify                  from '../util/verify';
 import {isBoolean, isFunction} from '../util/typeCheck';
 import {createLogger}          from '../util/logger';
 import Icon                    from '../util/ui/Icon.svelte'; // xx NEW

 // our internal diagnostic logger (normally disabled, but keep enabled for a while)
 const log = createLogger('***DIAG*** <TabEntry> ... ').enable();

 // component params
 export let tab; // ... TabController
 export let isActive=false;
 export let closeTabFn

 let contextMenu;

 // validate supplied parameters
 const check = verify.prefix('<TabEntry> parameter violation: ');
 // ... tab
 check(tab,               'tab is required');
 check(tab.getTabContext, `tab must be a TabController ... NOT: ${tab}`);
 // ... isActive
 check(isBoolean(isActive), `isActive must be a boolean ... NOT: ${isActive}`);
 // ... closeTabFn
 check(closeTabFn,             'closeTabFn is required');
 check(isFunction(closeTabFn), `closeTabFn must be a function ... NOT: ${closeTabFn}`);
</script>

<Tab {tab}
     minWidth
     on:contextmenu={(e) => {
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
{#if isActive}
  <!-- xx OLD
  <Icon class="material-icons close-icon" on:click={(e)=> closeTabFn(tab.getTabId())}>cancel_presentation</Icon>
  -->
  <!-- xx NEW -->
  <Icon class="close-icon" name="cancel_presentation" on:click={(e)=> closeTabFn(tab.getTabId())}/>
{/if}

<!-- our context menu -->
<span>
  <Menu bind:this={contextMenu}>
    <List>
      <Item on:SMUI:action={() => closeTabFn(tab.getTabId())}><Text>Close</Text></Item>
      <Item on:SMUI:action={() => alert('FUTURE: Close Others')}><Text>Close Others</Text></Item>
      <Item on:SMUI:action={() => alert('FUTURE: Close to Right')}><Text>Close to the Right</Text></Item>
      <Item on:SMUI:action={() => alert('FUTURE: Close All')}><Text>Close All</Text></Item>
      <Separator />
      <Item on:SMUI:action={() => alert('FUTURE: Reveal in Left Nav')}><Text>Reveal in Left Nav</Text></Item>
    </List>
  </Menu>
</span>

<style>
 * :global(.material-icons) { /* control <Icon> xx NO WORK :-( */
   cursor:    pointer;
   font-size: 18px;     /* reduce icon size */
   color:     lightgrey;
 }
</style>
