import SmartPkg    from './SmartPkg';
import pkgManager  from './pkgManager';
import verify      from 'util/verify';

/**
 * Load a package (SmartPkg) from an external resource (ex: web or
 * local file) and catalog it in pkgManager.
 *
 * The newly loaded package will automatically be registered in pkgManager
 * (via pkgManager.registerPkg()).
 *
 * @param {YetUnknown} [pkgResourcePath] - the optional resource
 * path of the package to retrieve.  When not supplied, an
 * interactive file picker dialog will be presented.
 *
 * @returns {SmartPkg via Promise} the newly loaded package
 * (undefined when user cancels the picker dialog).
 * 
 * @throws {Error} an Error is thrown in various scenarios
 * (pkgResourcePath not found, uninterpretable resource content,
 * invalid params, etc.).
 */
export async function loadPkg(pkgResourcePath) {
  // validate parameters
  const check = verify.prefix('loadPkg() parameter violation: ');

  // ... pkgResourcePath (when supplied)
  if (pkgResourcePath) {
    check(pkgResourcePath,       'currently only handles "interactive file picker dialog" ... do NOT know how to handle a pkgResourcePath param yet :-('); // AI: temp for now
    check(pkgResourcePath===123, 'pkgResourcePath (when supplied) must be a YetUnknown'); // AI: future TEMPLATE
  }
  else {
    // insure we have access to the "Native File System API TRIAL"
    if (!window.chooseFileSystemEntries) {
      throw new Error('***ERROR*** loadPkg() the "Native File System API TRIAL" is NOT available in this environment :-(')
        .defineAttemptingToMsg('use the interactive file picker dialog');
    }
  }

  // define our fileHandle
  // ... AI: determine how to retain a neutral version of this resource, for "save" operations (possibly in loaded SmartPkg)
  let fileHandle = null;

  /* AI: need pkgResourcePath out of fileHandle
     PROBLEM: can only get fileName ('textData.txt') NOT it's containing path/directory
     ... needs MORE research
     - fileHandle: {
     isDirectory: false
     isFile:      true
     name:        'testData.txt'
     }
     - file: {
     name:        'testData.txt'
     lastModified: 222333444
     webkitRelativePath: ''
     size:  123
     type: 'text/plain'
     - there is a fileHandle = directoryHandle.getFile(name)
   * there are TWO handle refs ... can be:
     - FileSystemFileHandle ........ handle.isFile
     - FileSystemDirectoryHandle ... handle.isDirectory
   */

  // ... when pkgResourcePath IS supplied, AI: figure this out
  if (pkgResourcePath) {
    // NOTE: currently errors out (in parameter validation above)
  }
  // ... when pkgResourcePath NOT supplied, select the fileHandle via an interactive file picker dialog
  else {
    try {
      fileHandle = await window.chooseFileSystemEntries();
    }
    catch(err) {
      // prune expected errors
      if (err.message === 'The user aborted a request.') { // ... user canceled request
        return; // return undefined when user cancels the picker dialog (as documented above)
      }
      // re-throw "qualified" unexpected errors
      throw err.defineAttemptingToMsg('use the file picker dialog');
    }
  }

  // load the file blob
  // ... NOTE: file is w3c - https://w3c.github.io/FileAPI/#dfn-file
  // ... for now, just pass through unexpected errors
  const file = await fileHandle.getFile();

  // resolve the file content
  // ... see: https://w3c.github.io/FileAPI/#text-method-algo
  // ... for now, just pass through unexpected errors
  const fileContent = await file.text();

  // resolve content to json
  let smartJSON = null
  try {
    smartJSON = JSON.parse(fileContent);
  }
  catch(err) { // SyntaxError
    // something about err emitted from JSON, doesn't show attemptingToMsg in discloseError() detail
    // >>> throw err.defineAttemptingToMsg('interpret resource as smartJSON in loadPkg()');
    // ... suspect it is somehow NOT purely Error based (not really sure what this is)
    // ... for now re-create it, but concerned may loose something out of the original
    throw new Error(`INVALID JSON - ${err.message}`)
    .defineUserMsg('Please select a valid visualize-it package'); // consider this a user error (in their selection)
  }

  // resolve to a SmartPkg
  // ... this auto adorns .defineAttemptingToMsg()
  const smartPkg = SmartPkg.fromSmartJSON(smartJSON);

  // register this package in our pkgManager
  pkgManager.registerPkg(smartPkg); // AI: is pkgResourcePath a param -OR- embedded in SmartPkg

  // that's all folks
  return smartPkg;
}
