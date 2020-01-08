import React            from 'react';

import {useFassets}     from 'feature-u';
import {useSelector}    from 'react-redux'

import {makeStyles}     from '@material-ui/core/styles';

import FingerPrintIcon  from '@material-ui/icons/Fingerprint';
import FormControl      from '@material-ui/core/FormControl';
import IconButton       from '@material-ui/core/IconButton';
import InputLabel       from '@material-ui/core/InputLabel';
import MenuItem         from '@material-ui/core/MenuItem';
import Select           from '@material-ui/core/Select';
import Toolbar          from '@material-ui/core/Toolbar';
import Typography       from '@material-ui/core/Typography';

export default function VitToolBar() {

  const classes = useStyles();

  // ?? drive dispMode through enum: dispMode: 'static', 'edit', 'animate'
  const [dispMode, setDispMode] = React.useState('static'); // ?? temp for now ... eventually redux

  const handleDispModeChange = event => {
    console.log(`?? DispMode Changed to: ${event.target.value}`);
    setDispMode(event.target.value);
  };

  const fassets   = useFassets();
  const totalTabs = useSelector((appState) => fassets.sel.getTotalTabs(appState), [fassets]);

  const myTitle = (
    <Typography variant="h6"
                color="inherit"
                noWrap
                className={classes.title}>
      Visualize It
    </Typography>
  );

  if (totalTabs === 0) {
    return myTitle;
  }

  return (
    <Toolbar variant="dense">

      { myTitle }

      <IconButton><FingerPrintIcon/></IconButton>

      {/* NOTE: NO containing <IconButton> here ...  adds too much height */}
      <FormControl>
        <InputLabel id="dispModeLabel">DispMode</InputLabel>
        <Select id="dispMode"
                labelId="dispModeLabel"
                value={dispMode}
                onChange={handleDispModeChange}>
          <MenuItem value={'static'}>Static</MenuItem>
          <MenuItem value={'edit'}>Edit</MenuItem>
          <MenuItem value={'animate'}>Animate</MenuItem>
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

