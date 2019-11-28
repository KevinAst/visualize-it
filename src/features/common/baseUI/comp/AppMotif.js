import React,
       {useMemo}      from 'react';
import PropTypes      from 'prop-types';

import {useFassets}   from 'feature-u';
import {useSelector}  from 'react-redux'

import {makeStyles}   from '@material-ui/core/styles';

import LeftNav        from './LeftNav';
import UserMenu       from './UserMenu';

import AppBar         from '@material-ui/core/AppBar';
import IconButton     from '@material-ui/core/IconButton';
import MenuIcon       from '@material-ui/icons/Menu';
import Toolbar        from '@material-ui/core/Toolbar';
import Typography     from '@material-ui/core/Typography';

import {toast}        from 'util/notify';

/**
 * AppMotif is a re-usable top-level component that establishes
 * the following application characteristics:
 * 
 * - a **Left Nav** menu
 * - a **User Menu** menu
 * - a **Current View** state _(orchestrating which application view is active)_
 * - a **Tool Bar** with various artifacts (ex: title bar and footer)
 * 
 * While these controls are promoted through AppMotif, it's content
 * is accumulated from external features through various **Use
 * Contracts**.

 * AppMotif is auto injected through the MainLayout component,
 * however, it is only active when an active user is **signed-in**.
 * 
 * The main page content is rendered as children of this component
 * (like eateries, discovery, etc.).
 *
 * USAGE:
 * ```
 *   <AppMotif>
 *     ... app page content here
 *   </AppMotif>
 * ```
 * 
 * Please refer to the **`baseUI` README** for more information.
 */
export default function AppMotif({children}) {

  const fassets = useFassets();

//const curUser = useSelector( (appState) => fassets.sel.curUser(appState), [fassets] );
  const curView = useSelector( (appState) => fassets.sel.curView(appState), [fassets] );

  const classes = useStyles();

  // define our auxiliary view content
  const viewAuxiliaryContent    = fassets.get('AppMotif.auxViewContent.*@withKeys');
  const curViewAuxiliaryContent = useMemo(() => resolveCurViewAuxiliaryContent(curView, viewAuxiliaryContent), [curView, viewAuxiliaryContent]);
  const {TitleComp, FooterComp} = curViewAuxiliaryContent;

  // no-op when no user is signed-in ... AI: DECIDE_AUTH_USER_NEEDED
//if (!curUser.isUserSignedIn()) {
//  return (
//    <>
//      {children}
//    </>
//  );
//}

  return (
    <div className={classes.app}>

      {/* Title Bar */}
      <AppBar className={classes.appBar}
              position="fixed"> {/* NOTE: eatery-nod-w used position "absolute" ... don't see any diff */}
        <Toolbar className={classes.toolbar}
                 variant="dense"
                 disableGutters={false}> {/*NOTE: doesn't seem that disableGutters does anything */}

          {/* AI: Consider for some App Menu */}
          <IconButton className={classes.menuButton}
                      color="inherit"
                      onClick={ async () => {
                          // toast.warn({msg: 'App Menu NOT implemented yet (coming soon)!'}) // ?? original
                          try {
                            const fileHandle  = await window.chooseFileSystemEntries(); // AI: eventually retain this in outer scope IF you need to reuse
                            const file        = await fileHandle.getFile();
                            const fileContent = await file.text();
                            toast({msg: `local fileContent:\n\n${fileContent}`});
                            //? toast({msg: 'see console for file content :-)'});
                            //? console.log(`local fileContent:\n\n${fileContent}`);
                          }
                          catch (err) {
                            if (err.message !== 'The user aborted a request.') {
                              toast.error({msg: `err in local file handler: ${err.message}`});
                              console.log('err in local file handler: ', err);
                            }
                          }
                      }}>
            <MenuIcon/>
          </IconButton>

          {/* Title */}
          <div className={classes.title}>
            <TitleComp/>
          </div>

          {/* User Profile Menu ... AI: DECIDE_AUTH_USER_NEEDED ... curUser prop usage
          <UserMenu curUser={curUser}/>
            */}
          <UserMenu/>

        </Toolbar>
      </AppBar>

      {/* Left Nav */}
      <LeftNav/>

      {/* Page Content */}
      <main className={classes.content}>

        <Toolbar variant="dense"
                 comment="spacer (hidden UNDER AppBar) so our main content isn't covered up by the AppBar"/>

        {children}
      </main>

      {/* Optional Bottom Bar */}
      {FooterComp && (
         <AppBar className={classes.bottomBar}
                 position="absolute">
           <Toolbar className={classes.toolbar}
                    variant="dense"
                    disableGutters={false}>
             <FooterComp/>
           </Toolbar>
         </AppBar>
       )}

    </div>
  );
}

AppMotif.propTypes = {
  children: PropTypes.node.isRequired, // main page content (like eateries and discovery)
};


const useStyles = makeStyles( theme => ({

  app: {
    display: 'flex', // KJB: does not seem to be doing anything
  },

  appBar: {
    zIndex:     theme.zIndex.drawer + 1, // NOTE: forces AppBar to be OVER LeftNav (a drawer) ... this is new for fixed LeftNav
  },

  bottomBar: {
    top:        'auto',
    bottom:     0,
  },

  toolbar: {
    // ***Dashboard Sample***
    // paddingRight: 24, // keep right padding when drawer closed
  },

  menuButton: {
    marginRight: 36, // proper spacing between menu button and title
  },

  title: {
    flexGrow: 1, // moves right-most toolbar items to the right
  },

  content: {
    flexGrow: 1,
    height: '100vh',                 // content window is height is same as our viewport (100%)
    overflow: 'auto',                // add scrollbar ONLY when necessary
  },
}) );


function resolveCurViewAuxiliaryContent(curView, viewAuxiliaryContent) {
  const matchKey = `AppMotif.auxViewContent.${curView}`;
  const [, curViewAuxiliaryContent] = viewAuxiliaryContent.find( ([key]) => key === matchKey ) || fallbackViewAuxiliaryContent;
  return curViewAuxiliaryContent;
}

const fallbackViewAuxiliaryContent = ['AppMotif.auxViewContent.FALLBACK', {
  // TODO: unsure if we need a customizable Title in our header
  //       - temporarily make "App Motif" "Visualize It" 
  //       = research further
  TitleComp: () => (
    <Typography variant="h6"
                color="inherit"
                noWrap>
      Visualize It
    </Typography>
  ),
}];
