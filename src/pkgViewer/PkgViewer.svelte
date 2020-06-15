<script context="module">
 import verify         from '../util/verify';

 // DESC: The <PkgViewer> component visualizes one or more SmartPkgs
 //       in the LeftNav section of the visualize-it GUI.
 //       It is a "singleton" UI Component, instantiated one time, via
 //       appLayout's `registerLeftNavEntry()` process.

 // NOTE: vars prefixed with underbar ("_"):
 //       - represent component instance state of the one-and-only <PkgViewer> instance
 //       - are initialized through life-cycle-hooks (e.g. onMount())
 //       - are indirectly used for public promotion to the outside world

 let _viewPkg$comp; // ... functional component binding supporting our public promotion
 const activate = (viewPkg$comp) => {
   // verify singleton restriction
   verify(!isActive(), 'only ONE <PkgViewer/> component should be instantated (somewhere in the app root)');

   // register component binding
   _viewPkg$comp = viewPkg$comp;

   // process any prior cached requests
   if (cachedPkgs.length) {
     cachedPkgs.forEach( (pkg) => viewPkg(pkg));
     cachedPkgs = [];
   }

 };
 const deactivate = () => _viewPkg$comp = null;
 const isActive   = () => _viewPkg$comp ? true : false;

 //***
 //*** PUBLIC API
 //***

 let cachedPkgs = [];

 // + viewPkg(pkg): void ... add supplied pkg (SmartPkg) to self's view
 export function viewPkg(pkg) {
   // process request ... when we are active
   if (isActive()) {
     _viewPkg$comp(pkg);
   }
   // cache requests ... when we are inactive
   else {
     cachedPkgs.push(pkg);
   }
 }

</script>

<script>
 import {isPkg}   from '../util/typeCheck';
 import {onMount} from 'svelte';
 import ViewPkg   from './ViewPkg.svelte';
 import {Item, Meta, Text} from '@smui/list';

 // the packages viewed by self: SmartPkg[]
 const pkgs = [];

 // add supplied pkg (SmartPkg) to self's view
 function viewPkg$comp(pkg) {
   // validate supplied parameters
   const check = verify.prefix('viewPkg$comp(pkg) parameter violation: ');
   // ... pkg
   check(pkg,        'pkg is required');
   check(isPkg(pkg), 'pkg must be a SmartPkg');

   // register the new pkg to self
   pkgs.push(pkg);
   pkgs = pkgs; // ... make responsive to Svelte
 }

 // maintain our external bindings (when <PkgViewer> is mounted)
 onMount(() => activate(viewPkg$comp), deactivate);
</script>

<Item on:click={() => alert('FUTURE: open dialog')}>
  <Text>packages ...</Text>
  <Meta class="material-icons">folder_open</Meta>
</Item>


{#each pkgs as pkg (pkg.getPkgId())}
  <ViewPkg {pkg}/>
{/each}
