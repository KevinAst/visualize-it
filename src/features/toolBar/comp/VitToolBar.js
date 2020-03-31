import React,
       {useState,
        useCallback}    from 'react';

import {useFassets}     from 'feature-u';
import {useSelector,
        useDispatch}    from 'react-redux'

import DispMode         from 'core/DispMode';

import {tabRegistry, 
        changeManager}  from 'features/xtra';

import {createLogger}   from 'util/logger';
import {toast}          from 'util/notify';

import * as _toolBarSel from '../state';
import _toolBarAct      from '../actions';

import {makeStyles}     from '@material-ui/core/styles';

import FingerPrintIcon  from '@material-ui/icons/Fingerprint';
import RedoIcon         from '@material-ui/icons/Redo';
import UndoIcon         from '@material-ui/icons/Undo';
import IconButton       from '@material-ui/core/IconButton';
import MenuItem         from '@material-ui/core/MenuItem';
import Select           from '@material-ui/core/Select';
import Toolbar          from '@material-ui/core/Toolbar';
import Typography       from '@material-ui/core/Typography';
import Tooltip          from '@material-ui/core/Tooltip';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <VitToolBar> ... ').disable();

//***
//*** Component: VitToolBar
//***
export default function VitToolBar() {

  const classes = useStyles();

  const fassets     = useFassets();
  const activeTabId = useSelector((appState) => fassets.sel.getActiveTabId(appState), [fassets]); // ... activeTabId is NOT pkgEntryId (IS: 'com.astx.KONVA-scenes-scene1' NOT: 'com.astx.KONVA/scene1')

  // fallback to generic title, when NO tabs are active
  if (!activeTabId) {
    return (
      <Typography variant="h6"
                  color="inherit"
                  noWrap
                  className={classes.title}>
        Visualize It
      </Typography>
    );
  }

  const pkgEntry = tabRegistry.getTabController(activeTabId).getTarget(); // ... target IS pkgEntry

  // add stale indicator to pkgName
  // ... AI: suspect responsiveness is working ONLY because we are refreshing too often <<< need to make responsive for real
  const pkg          = pkgEntry.getPkg();
  const pkgNameLabel = pkg.getPkgName() + (pkg.isInSync() ? '' : ' **');

  return (
    <Toolbar variant="dense">
      <Typography variant="h6"
                  color="inherit"
                  noWrap
                  className={classes.title}>
        {pkgNameLabel}
      </Typography>

      <UndoRedoTool/>

      <Tooltip title="Silly Fingerprint">
        <IconButton onClick={()=>toast({msg: 'Silly little fingerprint!'})}><FingerPrintIcon/></IconButton>
      </Tooltip>

      <DispModeTool/>

    </Toolbar>
  );

}

const useStyles = makeStyles( theme => ({
  title: {
    flexGrow: 1, // moves right-most toolbar items to the right
  },
}) );



//***
//*** Component: DispMode
//***
function DispModeTool() {

  const fassets     = useFassets();
  const dispMode    = useSelector((appState) => _toolBarSel.getDispMode(appState),    []);
  const activeTabId = useSelector((appState) => fassets.sel.getActiveTabId(appState), [fassets]); // ... activeTabId is NOT pkgEntryId (IS: 'com.astx.KONVA-scenes-scene1' NOT: 'com.astx.KONVA/scene1')

  const dispatch             = useDispatch();
  const handleDispModeChange = useCallback((event) => {
    const newDispMode = DispMode.enumValueOf(event.target.value);
    log(`dispMode changed to: ${newDispMode}`);
    dispatch( _toolBarAct.dispModeChanged(newDispMode) );
  }, [dispatch]);

  const pkgEntry = tabRegistry.getTabController(activeTabId).getTarget(); // ... target IS pkgEntry

  // GEEZE: have to manage DispMode ToolTip so it doesn't cover up the active <Select>
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const openTooltip  = () => setTooltipOpen(true);
  const closeTooltip = () => setTooltipOpen(false);

  return (
    <Tooltip title="Display Mode"
             open={tooltipOpen}>
      <IconButton>
        <Select id="dispMode"
                labelId="dispModeLabel"
                value={dispMode.enumKey}
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
                onMouseDown={closeTooltip}
                onChange={handleDispModeChange}>
          { 
            Array.from(DispMode).map( (dm) => (
              <MenuItem key={dm.enumKey}
                        value={dm.enumKey}
                        disabled={!pkgEntry.canHandleDispMode(dm)}>{dm.enumKey}</MenuItem>
            ) )
          }
        </Select>
      </IconButton>
    </Tooltip>
  );

}


//***
//*** Component: UndoRedoTool
//***
function UndoRedoTool() {

  const fassets     = useFassets();
  const dispMode    = useSelector((appState) => _toolBarSel.getDispMode(appState),    []);
  const activeTabId = useSelector((appState) => fassets.sel.getActiveTabId(appState), [fassets]); // ... activeTabId is NOT pkgEntryId (IS: 'com.astx.KONVA-scenes-scene1' NOT: 'com.astx.KONVA/scene1')

  const pkgEntry    = tabRegistry.getTabController(activeTabId).getTarget(); // ... target IS pkgEntry
  const pkgEntryId  = pkgEntry.getEPkgId();

  const isUndoAvail = useSelector((appState) => fassets.sel.isUndoAvail(appState, pkgEntryId), [fassets, pkgEntryId]);
  const isRedoAvail = useSelector((appState) => fassets.sel.isRedoAvail(appState, pkgEntryId), [fassets, pkgEntryId]);

  const handleUndo  = () => changeManager.applyUndo(pkgEntryId);
  const handleRedo  = () => changeManager.applyRedo(pkgEntryId);

  // no-op if NOT in edit mode
  if (dispMode !== DispMode.edit) {
    return null;
  }
  
  return (
    <>
    <Tooltip title="Undo">
      <span>
        <IconButton disabled={!isUndoAvail} onClick={handleUndo}><UndoIcon/></IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Redo">
      <span>
        <IconButton disabled={!isRedoAvail} onClick={handleRedo}><RedoIcon/></IconButton>
      </span>
    </Tooltip>
    </>
  );

}
