import React,
       {useState,
        useCallback}       from 'react';
import Collapse            from '@material-ui/core/Collapse';
import ExpandLessIcon      from '@material-ui/icons/ExpandMore';   // in effect WHEN EXPANDED  ... i.e. clicking will collapse
import ExpandMoreIcon      from '@material-ui/icons/ChevronRight'; // in effect WHEN COLLAPSED ... i.e. clicking will expand
import ListItem            from '@material-ui/core/ListItem';
import ListItemIcon        from '@material-ui/core/ListItemIcon';
import ListItemText        from '@material-ui/core/ListItemText';
import PaletteIconDefault  from '@material-ui/icons/Palette';
import Paper               from '@material-ui/core/Paper';
import {makeStyles}        from '@material-ui/core/styles';


/**
 * LeftNavCollapsibleItem: A top-level LeftNav entry that adorns it's children
 *                         (the pallet) with a collapsible control.
 *
 * The pallet (i.e. the children) will typically contain an expandable
 * tree ... however this is not required.
 */
export default function LeftNavCollapsibleItem({name, PaletteIcon=PaletteIconDefault, children}) {

  const classes         = useStyles();
  const [open, setOpen] = useState(false);
  const toggleExpansion = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <>
    <ListItem button onClick={toggleExpansion}>
      <ListItemIcon>
        <PaletteIcon/>
      </ListItemIcon>
      <ListItemText primary={name}/>
      {open ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
    </ListItem>
    <Collapse in={open}
              // NOTE: removed unmountOnExit (was causing tree expansion to loose state)
              timeout="auto">
      <Paper className={classes.pallet}>
        {children}
      </Paper>
    </Collapse>
    </>
  );
}

const useStyles = makeStyles( theme => ({
  pallet: {
    margin:  theme.spacing(0, 2, 2, 2),
    padding: theme.spacing(1),
  },
}) );
