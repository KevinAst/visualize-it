<script context="module">
 import List, {Item, Meta, Text, Separator} from '@smui/list';
 import Menu            from '@smui/menu';
 import verify          from '../util/verify';
 import {isPkg}         from '../util/typeCheck';
 import {createLogger}  from '../util/logger';
 const  log = createLogger('***DIAG*** <ViewPkg> ... ').disable();

 import ViewPkgTree     from './ViewPkgTree.svelte';
</script>

<script>
 // component parameters
 export let pkg;

 // validate supplied parameters
 const check = verify.prefix('<ViewPkg> parameter violation: ');
 // ... pkg
 check(pkg,        'pkg is required');
 check(isPkg(pkg), `pkg must be a SmartPkg ... NOT: ${pkg}`);

 let menu;
</script>

<!-- using activated strictly for it's coloring :-) -->
<Item class="vit-drawer-item" activated on:click={() => menu.setOpen(true)}>
  <Text>{log(`rendering pkg: ${pkg.getPkgName()}`) || pkg.getPkgName()}</Text>
  <Meta class="material-icons">more_vert</Meta>
</Item>

<span>
  <Menu bind:this={menu}>
    <List>
      <Item on:SMUI:action={() => alert('FUTURE: Save')}><Text>Save {pkg.getPkgName()}</Text></Item>
      <Item on:SMUI:action={() => alert('FUTURE: Save-As')}><Text>Save As ...</Text></Item>
      <Separator/>
      <Item on:SMUI:action={() => alert('FUTURE: Rename')}><Text>Rename</Text></Item>
      <Separator/>
      <Item on:SMUI:action={() => alert('FUTURE: Close')}><Text>Close</Text></Item>
    </List>
  </Menu>
</span>

<ViewPkgTree {pkg}/>


<style>
 /* vit-drawer-item: attempt to space out <ViewPkgTree> content a bit better */
 * :global(.vit-drawer-item) {
   margin: 8px 8px 0px 8px !important;
 }
</style>
