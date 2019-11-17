import React           from 'react';

import {makeStyles}    from '@material-ui/core/styles';
import Typography      from '@material-ui/core/Typography';
import Paper           from '@material-ui/core/Paper';
import CenterItems     from 'util/CenterItems';


/**
 * StartUpPage: our initial display when NO tabs are active.
 */
export default function StartUpPage() {

  const classes = useStyles();

  // NOTE: relative path (in imgs below) support server deployment in sub-directory
  // ?? HACK: how to fill all vertical space (using calc below) see TabManager.js note
  return (
    <Paper className={classes.root} style={{height: 'calc(100% - 48px)'}}>
      <CenterItems>
        <img src="visualize-it-logo.png" width="300" alt="Logo" className={classes.entry} />
      </CenterItems>
      <CenterItems>
        <Typography variant="h4" color="inherit" noWrap className={classes.entry} >
          Your View into External Systems!
        </Typography>
      </CenterItems>
      <CenterItems>
        <img src="visualize-it-logo-eyes.jpg" alt="Logo Eyes" className={classes.entry}/>
      </CenterItems>
    </Paper>
  );
}

const useStyles = makeStyles( theme => ({
  root: {
    padding: theme.spacing(3, 2, 15),
  },

  entry: {
    marginTop: theme.spacing(2),
  },
}) );
