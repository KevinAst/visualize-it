import TabController    from '../util/ui/tabManager/TabController';

import verify           from '../util/verify';
import {isPkgEntry}     from '../util/typeCheck';

import SmartView        from '../core/SmartView';
import RenderSmartView  from '../core/RenderSmartView.svelte'

import PkgEntryTabsContextMenu  from './PkgEntryTabsContextMenu.svelte'

/**
 * TabControllerPkgEntry is a concrete class that manages PkgEntry tabs
 */
export default class TabControllerPkgEntry extends TabController {

  /**
   * Create a TabControllerPkgEntry.
   *
   * @param {PkgEntry} pkgEntry the pkgEntry being displayed/managed by this tab.
   */
  constructor(pkgEntry) {
    // inject content in our parent class
    super(pkgEntry.getPkgEntryId(), // tabId
          pkgEntry.getName());      // tabName

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... pkgEntry
    check(pkgEntry,              'pkgEntry is required');
    check(isPkgEntry(pkgEntry),  'pkgEntry must be a PkgEntry object');

    // retain state specific to this derivation
    this.pkgEntry = pkgEntry;
    // ... re-use previously created SmartView instances
    //     - would happen when multiple/duplicate registrations occur to a TabManager
    //       ... in current code this does NOT happen (so this is defensive only)
    //     - we cannot create duplicate SmartView objects (per pkgEntry)
    //       ... because pkgEntry.viewParent will only reference the latest SmartView
    //       ... causing integrity issues
    //           ex: smartObject.trickleUpChange() CATASTROPHIC ERROR when it hits a rogue SmartView that is NOT mounted
    this.view = pkgEntry.viewParent || new SmartView({id: `view-${this.getTabId()}`, name: `view-${this.getTabName()}`, pallet: pkgEntry});
  }

  /**
   * Return self's qualifying description (in THIS derivation, the Pkg name
   * of a PkgEntry).  This is used (in one case) to supplement/qualify
   * the active tab in the AppBar.  So in this example, it helps to
   * qualify two PkgEntries with the same name in different packages.
   *
   * @returns {string} self's qualifying supplemental description (our Pkg name)
   */
  getTabQualifyingDesc() {
    return this.pkgEntry.getPkg().getPkgName();
  }

  /**
   * Expose our pkgEntry - the app-specific object targeted by this tab.
   */
  getTabContext() {
    return this.pkgEntry;
  }

  /**
   * Expose our component to be rendered in the tab panel.
   */
  getTabPanel() {
    return {Comp: RenderSmartView, props: {view: this.view}};
  }

  /**
   * Expose our supplement to the Tab's popup context menu.
   * By default, no AppContextMenuComp is provided (i.e. returns null).
   */
  getAppContextMenu() {
    return PkgEntryTabsContextMenu; // <PkgEntryTabsContextMenu tab={tabContext}/>
  }

}
TabControllerPkgEntry.unmangledName = 'TabControllerPkgEntry';
