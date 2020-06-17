<script context="module">
 import verify  from '../util/verify';

 // DESC: The <TabManager> component manages the dynamics of all tabs
 //       in the visualize-it GUI.
 // 
 //       It is a "singleton" UI Component, instantiated one time within the
 //       appLayout feature.
 // 
 //       It is broken into two separate components:
 //         - an outer component: <TabManager>  ... promoting the Static Public API of the "singleton"
 //         - an inner component: <TabManager$> ... containing the business logic, state, and instance API

 // maintain our component binding supporting our Static Public API promotion
 let _tabManager$; // our internal component instance
 const isMounted = () => _tabManager$ ? true : false;
 const mounted   = (tabManager$) => {
   // verify singleton restriction
   verify(!isMounted(), 'only ONE <TabManager/> component should be instantated (it is a "singleton" UI Component)');

   // maintain our component binding
   _tabManager$ = tabManager$;
 };
 const unmounted = () => {
   // unregister our component binding
   _tabManager$ = undefined;
 };
 const verifySetup = (fnName) => {
   verify(isMounted(), `${fnName} pre-condition violation: this function is ONLY operational when the <TabManager/> component has been instantated`);
 }

 //***
 //*** STATIC PUBLIC API:
 //***

 // NOTE: These functions mirror the those promoted in the <TabManager$> component instance.
 //       They merely propogate the request to the component instance,
 //       after verifying our setup.

 // + activateTab(tabId, preview=true): void ... activate tab preregistered to given tabId
 export function activateTab(tabId, preview=true) {
   verifySetup('activateTab()');
   _tabManager$.activateTab(tabId, preview);
 }
</script>


<script>
 import {onMount}   from 'svelte';
 import TabManager$ from './TabManager$.svelte';

 // maintain our external bindings (when <TabManager> is mounted)
 let tabManager$;
 onMount(() => mounted(tabManager$), unmounted);
</script>


<!-- instantiate our internal component -->
<TabManager$ bind:this={tabManager$}/>
