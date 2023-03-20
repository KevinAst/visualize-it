import './util/ErrorExtensionPolyfill'; // value-added Error extensions, providing ability to handle ALL errors more generically
import './core/preregisterCoreClasses'; // pre-register our "core" SmartPkg very early, allowing pkgManager to resolve "core" packages

// include various features
// ... may have to move (based on dependencies)
// ... currently only a "few" features
import './sandbox'; // TODO: ?? before we can include this, must resolve Svelte duplicate JS class definitions

// now process our GUI App!!
import App from './App.svelte'; // ?? ORIGINAL visualize-it app
//import App from '././util/ui/svelte-native-forms/demo/DemoApp.svelte';          // ?? TEMP "mutually exclusive" for SNF demo
//import App from '././util/ui/svelte-native-forms/demo/OBSOLETE/DemoApp.svelte'; // ?? TEMP "mutually exclusive" for original SNF demo app

const app = new App({
	target: document.body,
});

export default app;
