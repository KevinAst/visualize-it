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
 import {onMount}          from 'svelte';
 import ViewPkg            from './ViewPkg.svelte';
 import {Item, Meta, Text} from '@smui/list';
 import {openPkg}          from '../core/pkgPersist';
 import Icon               from '../util/ui/Icon.svelte';
 import {isPkg}            from '../util/typeCheck';
 import {toast}            from '../util/ui/notify';
 import discloseError      from '../util/discloseError';
 import {TabControllerPkgEntry,
         preregisterTab}   from '../pkgEntryTabs';

 // the packages viewed by self: SmartPkg[]
 const pkgs = [];

 // add supplied pkg (SmartPkg) to self's view
 function viewPkg$comp(pkg) {
   // validate supplied parameters
   const check = verify.prefix('viewPkg(pkg) parameter violation: ');
   // ... pkg
   check(pkg,        'pkg is required');
   check(isPkg(pkg), 'pkg must be a SmartPkg');
   const dupPkg = pkgs.find( (p) => p.getPkgId() === pkg.getPkgId() );
   check(!dupPkg, `pkg ${pkg.getPkgId()} has already been registered ... cannot view it multiple times`);

   // register the new pkg to self
   pkgs.push(pkg);
   pkgs = pkgs; // ... make responsive to Svelte

   // pre-register pkg entries to our tabManager
   preregisterTabs(pkg.rootDir);
   // ... recursive routine kept here to be close (technically does NOT need to be an inner function)
   function preregisterTabs(treeNode) {
     // for PkgTreeDirs, recurse into each node
     if (treeNode.isDir()) {
       const dirEntries = treeNode.getChildren();
       dirEntries.forEach( (subNode) => preregisterTabs(subNode) );
     }
     // for PkgTreeEntries, pre-register it's pkgEntry to our tabManager
     else if (treeNode.isEntry()) {
       const pkgEntry      = treeNode.getEntry(); // ... a SmartPallet (Scene/Collage/CompRef)
       const tabController = new TabControllerPkgEntry(pkgEntry);
       preregisterTab(tabController);
     }
   }
 }

 // maintain our external bindings (when <PkgViewer> is mounted)
 onMount(() => activate(viewPkg$comp), deactivate);

 // Open (i.e. load) a SmartPkg selected from the user's local file system.
 async function handleOpenPkg() {
   try {
     const pkg = await openPkg();
     if (!pkg) {
       return; // no-op when user canceled the pick dialog
     }

     // register pkg in self's PkgViewer
     viewPkg(pkg);

     toast({msg: `"${pkg.getPkgName()}" has been loaded in the Left Nav Menu`})
   }
   catch (err) {
     // gracefully report unexpected conditions to user
     discloseError({err, logIt:true});
   }
 }


</script>

<Item>
  <Text>Packages ...</Text>
  <Meta>
    <Icon name="add_circle_outline"
          title="Create New Package"
          on:click={() => alert('FUTURE: add new package')}/>
    <Icon name="folder_open"
          title="Open Existing Package"
          on:click={handleOpenPkg}/>
  </Meta>
</Item>


{#each pkgs as pkg (pkg.getPkgId())}
  <ViewPkg {pkg}/>
{/each}
