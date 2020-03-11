import React,
       {useState,
        useCallback,
        useMemo}        from 'react';

import SmartComp        from 'core/SmartComp';
import {openPkg}        from 'core/pkgPersist';
import pkgManager       from 'core/pkgManager';

import {leftNavManager,
        tabManager}     from 'features';

import discloseError    from 'util/discloseError';
import verify           from 'util/verify';
import {toast}          from 'util/notify';

import {useFassets}     from 'feature-u';
import {useSelector}    from 'react-redux'

import Button           from '@material-ui/core/Button';
import Menu             from '@material-ui/core/Menu';
import MenuItem         from '@material-ui/core/MenuItem';
import Typography       from '@material-ui/core/Typography';

/**
 * FileMenu: our FileMenu component.
 */
export default function FileMenu() {

  const [anchorFileMenu, setAnchorFileMenu] = useState(null);
  const fileMenuOpen = useMemo(() => Boolean(anchorFileMenu), [anchorFileMenu]);

  const openFileMenu = useCallback((event) => setAnchorFileMenu(event.currentTarget), []);
  _closeFileMenu     = useCallback(()      => setAnchorFileMenu(null),                []);

  const fassets      = useFassets();
  const activeTabId  = useSelector( (appState) => fassets.sel.getActiveTabId(appState), [fassets] );
  const isActiveTab  = activeTabId ? true : false;

  return (
    <div>
      <Button color="inherit"
              onClick={openFileMenu}>

        <Typography variant="button"
                    color="inherit"
                    noWrap>
          File
        </Typography>
      </Button>
      <Menu anchorEl={anchorFileMenu}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={fileMenuOpen}
            onClose={closeFileMenu}>

        <MenuItem onClick={handleOpenPkg}>Open ...</MenuItem>
        <MenuItem onClick={() => handleSavePkg(activeTabId)}   disabled={!isActiveTab}>Save</MenuItem>
        <MenuItem onClick={() => handleSaveAsPkg(activeTabId)} disabled={!isActiveTab}>Save As ...</MenuItem>

      </Menu>
    </div>
  );
}

/**
 * Utility function that closes our file menu.
 */
function closeFileMenu() {
  if (_closeFileMenu) {
    _closeFileMenu();
  }
}
let _closeFileMenu = null;


/**
 * Open (i.e. load) a SmartPkg selected from the user's local file system.
 */
async function handleOpenPkg() {
  closeFileMenu();

  try {
    const smartPkg = await openPkg();
    if (!smartPkg) {
      return; // no-op when user canceled the pick dialog
    }

    // register it in our LeftNav
    // ... this dispatches an action, so any error cannot be caught here
    leftNavManager.addLeftNav(smartPkg);

    toast({msg: `"${smartPkg.getPkgDesc()}" has been loaded in the Left Nav Menu`})
  }
  catch (err) {
    // gracefully report unexpected conditions to user
    discloseError({err, logIt:true});
  }
}

/**
 * Save the supplied SmartPkg (identified from the supplied tab) to
 * it's original pkgResourcePath.
 *
 * @param {string} activeTabId - the tab identifier from which we
 * determine the SmartPkg to save.
 *
 * @throws {Error} an Error is thrown when the SmartPkg could not be
 * identified (an unexpected condition).
 */
async function handleSavePkg(activeTabId) {
  closeFileMenu();

  const pkg = resolvePkg(activeTabId);

  // ?? do something
  toast.warn({msg: 'Save coming soon!'});
}

/**
 * Save the supplied SmartPkg (identified from the supplied tab) to a
 * user selected originating PkgResourcePath.
 *
 * @param {string} activeTabId - the tab identifier from which we
 * determine the SmartPkg to save.
 *
 * @throws {Error} an Error is thrown when the SmartPkg could not be
 * identified (an unexpected condition).
 */
async function handleSaveAsPkg(activeTabId) {
  closeFileMenu();

  const pkg = resolvePkg(activeTabId);

  // ?? do something
  toast.warn({msg: 'Save As coming soon!'});
}


/**
 * Resolve the SmartPkg identified from the supplied tab.
 *
 * @param {string} activeTabId - the tab identifier from which we
 * determine the SmartPkg.
 *
 * @returns {SmartPkg} the package belonging to the supplied tab.
 *
 * @throws {Error} an Error is thrown when the SmartPkg could not be
 * identified (an unexpected condition).
 */
function resolvePkg(activeTabId) {
  // locate the package that contains the resource in the active tab
  const tabController = tabManager.getTabController(activeTabId);
  const targetObj     = tabController.getTarget(); // can be: Scene/Collage or SmartComp (for classes)
  let   pkg           = targetObj.getPackage();

  // for components (when classes are registered as SmartPkg entries),
  // there is no registered package (because the class is the contained item within the package)
  // ... in this case:
  //     - we use the package the component was created from (which is in fact the contained SmartPkg)
  //     - ultimately, however, this pkg is not persistable (because it is based on class)
  if (!pkg && targetObj instanceof SmartComp) {
    const classRef     = targetObj.getClassRef();
    const smartPkgName = classRef.getClassPkgName();
    pkg = pkgManager.getPackage(smartPkgName);
  }

  // verify the package is resolved
  verify(pkg, `***ERROR*** <FileMenu> "save/saveAs" operation ... could not locate the SmartPkg for the '${activeTabId}' active tab :-(`);

  // that's all folks :-)
  // console.log(`xx SmartPkg resolved: `, pkg);
  return pkg;
}
