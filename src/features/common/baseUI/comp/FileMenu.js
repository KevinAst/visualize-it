import React,
       {useState,
        useCallback,
        useMemo}        from 'react';

import Button           from '@material-ui/core/Button';
import Menu             from '@material-ui/core/Menu';
import MenuItem         from '@material-ui/core/MenuItem';
import Typography       from '@material-ui/core/Typography';

import {openPkg}        from 'core/pkgPersist';
import {leftNavManager,
        tabManager}     from 'features';
import discloseError    from 'util/discloseError';
import {toast}          from 'util/notify';

// ?? new
import SmartComp        from 'core/SmartComp';
import {useFassets}     from 'feature-u';
import {useSelector}    from 'react-redux'
import pkgManager       from 'core/pkgManager';

/**
 * FileMenu: our FileMenu component.
 */
export default function FileMenu() {

  const [anchorFileMenu, setAnchorFileMenu] = useState(null);
  const fileMenuOpen = useMemo(() => Boolean(anchorFileMenu), [anchorFileMenu]);

  const openFileMenu = useCallback((event) => setAnchorFileMenu(event.currentTarget), []);
  _closeFileMenu     = useCallback(()      => setAnchorFileMenu(null),                []);

  // ?? new
  const fassets     = useFassets();
  const activeTabId = useSelector( (appState) => fassets.sel.getActiveTabId(appState), [fassets] );

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
        <MenuItem onClick={() => handleSavePkg(activeTabId)}>Save</MenuItem>
        <MenuItem onClick={handleSaveAsPkg}>Save As ...</MenuItem>

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
 * Open a visualize-it SmartPkg from our local file system
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
 * Save the ??supplied smartPkg to it's originating PkgResourcePath.
 */
async function handleSavePkg(activeTabId) {
  closeFileMenu();

  if (!activeTabId) {
    toast.warn({msg: 'Your active tab identifies which package to save ... please activate a tab.'});
    return;
  }

  // locate the package that contains the resource in the active tab
  const tabController = tabManager.getTabController(activeTabId);
  const targetObj     = tabController.getTarget(); // can be: Scene/Collage or SmartComp (for classes)
  let   pkg           = targetObj.getPackage();

  // for components (when classes are registered as SmartPkg entries),
  // there is no registered package (because the class is the contained item in the package)
  // ... in this case:
  //     - we use the packate the component was created from (which is in fact the contained SmartPkg)
  //     - ultimately, however, this pkg is not persistable (because it is based on class)
  if (!pkg && targetObj instanceof SmartComp) {
    const classRef     = targetObj.getClassRef();
    const smartPkgName = classRef.getClassPkgName();
    pkg = pkgManager.getPackage(smartPkgName);
  }

  console.log(`?? now we can save the pkg: `, pkg);
  toast.warn({msg: 'Save coming soon! ... see the logs for the pkg that will be saved'});
}

/**
 * Save the ??supplied smartPkg to a user selected originating PkgResourcePath.
 */
async function handleSaveAsPkg() {
  closeFileMenu();

  toast.warn({msg: 'Save coming soon!'});
}
