import TabController  from './TabController';
import TabManager     from './TabManager';
import Tabs           from './Tabs.svelte';

/**
 * Promote the tabManager public API.
 * 
 * The `tabManager` package facilitates a set of of dynamic tabs for a
 * given context/visualization.
 * 
 * USAGE:
 * 
 * 1. Instantiate a TabManager that will manage all tabs for a given
 *    context/visualization.
 * 
 * 2. Render a `<Tabs>` UI component supplying it your tabManager property.
 * 
 * 3. Use the TabManager `preregisterTab(tabController)` API to preregister various
 *    tabs that have the potential of being displayed (using instances of
 *    TabController derivations).
 * 
 * 4. Use the TabManager `activateTab(tabId, preview=true)` API to visualize a given tab.
 *    The `tabId` is matched to the corresponding TabController (pre-registered).
 *    This can introduce a new dynamic tab (on first occurrence), or simply activate an
 *    existing tab (when it has previously been activated).
 *
 * **Note**: The properties and API of the TabManager object are packaged in
 *           such a way as to allow them to be used in a functional way.
 *           In other words, the methods are bound to the object
 *           instance, allowing them to be used as isolated functions.
 */
export {
  TabController, // the abstract base class through which app-specific "tab payload types" are supported (via derivation)
  TabManager,    // the dynamic tabs "manager" for a given context/visualizeation, containing both state (Svelte stores) and API 
  Tabs,          // the primary UI for the dynamic tabs (both the tabs and their content)
};
