<script context="module">
 import List, {Item, Meta, Text, Separator} from '@smui/list';
 import Menu            from '@smui/menu';
 import Icon            from '../util/ui/Icon.svelte';
 import verify          from '../util/verify';
 import {isPkg}         from '../util/typeCheck';

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

 // maintain our reflexive in-sync label qualifier
 const changeManager = pkg.changeManager;
 $: inSyncIcon       = $changeManager.inSyncIcon();
 $: pkgNameToolTip   = `Package: ${pkg.getPkgId()}` + ($changeManager.inSync ? '' : ' (modified - needs to be saved)');

 let menu;
</script>

<!-- using activated strictly for it's coloring :-) -->
<Item class="vit-drawer-item" activated title={pkgNameToolTip}>
  <Icon name="{pkg.getIconName()}"
        size="1.0rem"/>
  <Text>
    {pkg.getPkgName()}
    <Icon name={inSyncIcon}
          title="Package has been modified (needs to be saved) NOT SHOWING (qualified in pkgNameToolTip)"
          size="1.0rem"/>
  </Text>
  <Meta>
    <Icon name="save"
          title="Save Package"
          on:click={() => alert('FUTURE: save package')}/>
    <Icon name="more_vert"
          title="Manage Package"
          on:click={() => menu.setOpen(true)}/>
  </Meta>
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
