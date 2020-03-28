import React,
       {useCallback}    from 'react';

import {useFassets}     from 'feature-u';
import {useSelector,
        useDispatch}    from 'react-redux'

import DispMode         from 'core/DispMode';

import {tabRegistry}    from 'features';

import {createLogger}   from 'util/logger';

import * as _toolBarSel from '../state';
import _toolBarAct      from '../actions';

import {makeStyles}     from '@material-ui/core/styles';

import FingerPrintIcon  from '@material-ui/icons/Fingerprint';
import FormControl      from '@material-ui/core/FormControl';
import IconButton       from '@material-ui/core/IconButton';
import InputLabel       from '@material-ui/core/InputLabel';
import MenuItem         from '@material-ui/core/MenuItem';
import Select           from '@material-ui/core/Select';
import Toolbar          from '@material-ui/core/Toolbar';
import Typography       from '@material-ui/core/Typography';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <VitToolBar> ... ').disable();

export default function VitToolBar() {

  const classes = useStyles();

  const fassets     = useFassets();
  const dispMode    = useSelector((appState) => _toolBarSel.getDispMode(appState),           []);
  const activeTabId = useSelector((appState) => fassets.sel.getActiveTabId(appState), [fassets]);

  const dispatch             = useDispatch();
  const handleDispModeChange = useCallback((event) => {
    const newDispMode = DispMode.enumValueOf(event.target.value);
    log(`dispMode changed to: ${newDispMode}`);
    dispatch( _toolBarAct.dispModeChanged(newDispMode) );
  }, [dispatch]);

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

  const activeTarget = tabRegistry.getTabController(activeTabId).getTarget();

  return (
    <Toolbar variant="dense">

      <Typography variant="h6"
                  color="inherit"
                  noWrap
                  className={classes.title}>
        {activeTarget.getPkg().getPkgName()}
      </Typography>

      <IconButton><FingerPrintIcon/></IconButton>

      {/* NOTE: NO containing <IconButton> here ...  adds too much height */}
      <FormControl>
        <InputLabel id="dispModeLabel">DispMode</InputLabel>
        <Select id="dispMode"
                labelId="dispModeLabel"
                value={dispMode.enumKey}
                onChange={handleDispModeChange}>
        { 
          Array.from(DispMode).map( (dm) => (
            <MenuItem key={dm.enumKey}
                      value={dm.enumKey}
                      disabled={!activeTarget.canHandleDispMode(dm)}>{dm.enumKey}</MenuItem>
          ) )
        }
        </Select>
      </FormControl>

    </Toolbar>
  );

}

const useStyles = makeStyles( theme => ({

  title: {
    flexGrow: 1, // moves right-most toolbar items to the right
  },

}) );

