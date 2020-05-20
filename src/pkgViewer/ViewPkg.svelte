<script context="module">
 import List, {Item, Meta, Text, Separator} from '@smui/list';
 import Menu            from '@smui/menu'; // ?? menu needs work ... 1. anchor to activation button, 2. visable outside the <Item> constraints
 import {Anchor}        from '@smui/menu-surface'; // ?? 
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
 let menuAnchor;
</script>

<!-- using activated strictly for it's coloring :-) -->
<Item class="vit-drawer-item" activated={true}>
  <Text>{log(`rendering pkg: ${pkg.getPkgName()}`) || pkg.getPkgName()}</Text>
  <!-- ?? can put an IconButton in the Meta PRO: better animation CON: NOT vertically centered -->
  <Meta class="material-icons" on:click={() => menu.setOpen(true)}>more_vert</Meta>
  <!-- ?? use:Anchor must be applied to a native DOM element NOT component -->
  <!-- ?? mdc-menu-surface--anchor is TRASH ... found it in rogue site ?? I think that is what use:Anchor is doing -->
  <span use:Anchor bind:this={menuAnchor}>
    <!-- ?? CONFLICT: Menu has to be inside of it's anchor to be positioned correctly -->
    <!-- ?? HOWEVER: it appears that my manual anchor is NOT doing anything (SAME with/without anchor directives -->
  </span>
</Item>

<ViewPkgTree {pkg}/>

<!-- ?? CONFLICT: Menu has to be outside of <Item> so as to not be restricted by <Item>'s content -->
<Menu bind:this={menu} anchor={false} bind:anchorElement={menuAnchor} anchorCorner="BOTTOM_LEFT">
  <List>
    <Item on:SMUI:action={() => log.force('edit menu')}><Text>Edit {pkg.getPkgName()}</Text></Item>
    <Separator/>
    <Item on:SMUI:action={() => log.force('close menu')}><Text>Close</Text></Item>
    <Item on:SMUI:action={() => log.force('delete menu')}><Text>Delete</Text></Item>
  </List>
</Menu>

<style>
 /* vit-drawer-item: attempt to space out <ViewPkgTree> content a bit better */
 * :global(.vit-drawer-item) {
   margin: 8px 8px 0px 8px !important;
 }
</style>
