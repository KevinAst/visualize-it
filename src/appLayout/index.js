import AppLayout,
       {registerLeftNavEntry} from './AppLayout.svelte';
//? import AppLayout              from './AppLayout_BASELINE.svelte'; // ?? temp diagnostic: replace with OLD template

export {
  AppLayout,             // the one-and-only `<AppLayout/>` component to be instantiated at the app root
  registerLeftNavEntry,  // + registerLeftNavEntry(comp): void ... dynamically add supplied component entry to LeftNav
};
