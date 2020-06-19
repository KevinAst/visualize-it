import TabController    from './TabController';

import verify           from '../util/verify';
import {isPkgEntry}     from '../util/typeCheck';

import SmartView        from '../core/SmartView';
import RenderSmartView  from '../core/RenderSmartView.svelte'


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
    this.view     = new SmartView({id: `view-${this.getTabId()}`, name: `view-${this.getTabName()}`, pallet: pkgEntry});
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

}
TabControllerPkgEntry.unmangledName = 'TabControllerPkgEntry';
