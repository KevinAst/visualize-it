import AppLayout,
       {registerLeftNavEntry} from './AppLayout.svelte';
//? import AppLayout              from './AppLayout_BASELINE.svelte'; // ?? TEMPORARY: replace with OLD template
//? function registerLeftNavEntry(comp) {}

export {
  AppLayout,             // the one-and-only `<AppLayout/>` component to be instantiated at the app root
  registerLeftNavEntry,  // + registerLeftNavEntry(comp): void ... dynamically add supplied component entry to LeftNav
};
