import React,
       {useMemo}          from 'react';
import {useSelector}      from 'react-redux'
import PropTypes          from 'prop-types';
import {makeStyles}       from '@material-ui/core/styles';
import {MuiThemeProvider,      // NOTE: MuiThemeProvider **SHOULD** be at the root of ALL visible components
        createMuiTheme}   from '@material-ui/core/styles';
import CssBaseline        from '@material-ui/core/CssBaseline';
import AppMotif           from './AppMotif';
import Notify             from 'util/notify';
import SplashScreen       from 'util/SplashScreen';
import {getUITheme}       from '../state';


/**
 * MainLayout is a re-usable top-level component that promotes the
 * proper Material-UI (MUI) theming/styling WITH a responsive layout.
 * 
 * The following items are provided through this component:
 *
 * - a **Responsive Design** that auto adjusts for desktops, cell
 *   phones, and portable devices
 *
 * - a **UI Theme** allowing the user to choose from light/dark
 *   renditions
 *
 * - an **About Dialog** is promoted from information gleaned from the
 *   `package.json`
 *
 * - the **Notify** utility is activated, supporting programmatic
 *   **toasts, alerts, and confirmations**
 *
 * - the **SplashScreen** utility is activated, supporting the programmatic
 *   `splash(msg)` API
 * 
 * Please refer to the **`baseUI` README** for more information.
 */
export default function MainLayout({children}) {

  const uiTheme    = useSelector((appState) => getUITheme(appState), []);
  const themeInUse = useMemo(() => uiTheme==='dark' ? darkTheme : lightTheme, [uiTheme]);
  const classes    = useStyles();

  return (
    <MuiThemeProvider theme={themeInUse}>
      <CssBaseline/>
      <Notify/>
      <SplashScreen/>
      <main className={classes.main}>
        <AppMotif>
          {children}
        </AppMotif>
      </main>
    </MuiThemeProvider>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};


const lightTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontSize:        12,   // USE smaller font size ... default is 16 (seems more like 14)
  },

  palette: {
    type: 'light',
    // CREATED FROM: https://material.io/tools/color/
    primary: {                 // REF: Teal 800
      light:        '#439889',
      main:         '#00695c',
      dark:         '#003d33',
      contrastText: '#f5f5f5', // OVERRIDE: Grey 200
    },
    secondary: {               // REF: Red 800
      light:        '#ff5f52',
      main:         '#c62828',
      dark:         '#8e0000',
      contrastText: '#f5f5f5', // OVERRIDE: Grey 200
    },
  },
});

const darkTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontSize:        12,   // USE smaller font size ... default is 16 (seems more like 14)
  },
  palette: {
    type: 'dark',
    // CREATED FROM: https://material.io/tools/color/
    primary: {                 // REF: Teal 800
      light:        '#439889',
      main:         '#00695c',
      dark:         '#003d33',
      contrastText: '#f5f5f5', // OVERRIDE: Grey 200
    },
    secondary: {               // REF: Red 800
      light:        '#ff5f52',
      main:         '#c62828',
      dark:         '#8e0000',
      contrastText: '#f5f5f5', // OVERRIDE: Grey 200
    },
  },
});

const useStyles = makeStyles( theme => ({
  main: {
    width:        'auto',
    display:      'block', // Fix IE 11 issue.
 // marginLeft:   theme.spacing(3), // N/A: bad news for the overall layout
 // marginRight:  theme.spacing(3),

 // reactive design // N/A:  THIS IS CAUSING HAVOC on my main content container overall width
 // [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
 //   width:       400,
 //   marginLeft:  'auto',
 //   marginRight: 'auto',
 // },
  },
}) );
