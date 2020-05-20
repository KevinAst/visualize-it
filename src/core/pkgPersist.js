import SmartPkg    from './SmartPkg';
import pkgManager  from './pkgManager';
import verify      from '../util/verify';

/**
 * Load a package (SmartPkg) from an external resource (ex: web or
 * local file) and catalog it in pkgManager.
 *
 * The newly loaded package will automatically be registered in pkgManager
 * (via pkgManager.registerPkg()).
 *
 * @param {PkgResourcePath} [pkgResourcePath] - the optional resource
 * path of the package to retrieve.  When not supplied, an interactive
 * file picker dialog will be presented.
 *
 * @returns {SmartPkg via Promise} the newly loaded package (undefined
 * when user cancels the picker dialog).
 * 
 * @throws {Error} an Error is thrown in various scenarios
 * (pkgResourcePath not found, uninterpretable resource content,
 * invalid params, etc.).
 */
export async function openPkg(pkgResourcePath) {
  // validate parameters
  const check = verify.prefix('openPkg() parameter violation: ');

  // ... pkgResourcePath (when supplied)
  if (pkgResourcePath) {
    check(pkgResourcePath,       'pkgResourcePath is currently NOT a supported param (omit it to activate the "interactive file picker dialog")'); // AI: add support for pkgResourcePath
    check(pkgResourcePath===123, 'pkgResourcePath (when supplied) must be a YetUnknown'); // AI: future TEMPLATE
  }
  else { // ... for interactive file picker dialog
    // insure we have access to the "Native File System API TRIAL"
    if (!window.chooseFileSystemEntries) {
      throw new Error('***ERROR*** openPkg() the "Native File System API TRIAL" is NOT available in this environment :-(')
        .defineAttemptingToMsg('use the interactive file picker dialog');
    }
  }

  // define our fileHandle
  // ... AI: determine how to retain a neutral version of this resource, for "save" operations (possibly in loaded SmartPkg)
  let fileHandle = null;

  // ... when pkgResourcePath IS supplied
  if (pkgResourcePath) {
    // NOTE: currently errors out (in parameter validation above)
    // AI: figure this out
  }
  // ... when pkgResourcePath NOT supplied
  else {
    // select the fileHandle via an interactive file picker dialog
    try {
      fileHandle = await window.chooseFileSystemEntries({
        type: 'openFile',
        accepts: [{
          description: 'visualize-it file',
          extensions: ['vit'],
          mimeTypes: ['application/json'],
        }],
      });
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
    // >>> throw err.defineAttemptingToMsg('interpret resource as smartJSON in openPkg()');
    // ... suspect it is somehow NOT purely Error based (not really sure what this is)
    // ... for now re-create it, but concerned may loose something out of the original
    throw new Error(`INVALID JSON - ${err.message}`)
    .defineUserMsg('Please select a valid visualize-it package'); // consider this a user error (in their selection)
  }

  // resolve the json to a SmartPkg
  // ... this auto adorns .defineAttemptingToMsg()
  const pkg = SmartPkg.fromSmartJSON(smartJSON);

  // retain the pkgResourcePath
  pkg.setPkgResourcePath(fileHandle);

  // register this package in our pkgManager
  pkgManager.registerPkg(pkg);

  // reset the pkg baseline crc (reflecting what was pulled from our file)
  // pkg.resetBaseCrc(); // ... N/A because this is accomplished in the SmartPkg constructor

  // that's all folks
  return pkg;
}

/**
 * Save the supplied package (SmartPkg) to an external resource (ex:
 * web or local file).
 *
 * @param {SmartPkg} pkg - the package to be saved.
 * @param {boolean} [saveAs=false] - true: save in a user
 * selected file, false: save in the original pkg's `pkgResourcePath`.
 *
 * @returns {void | 'UserCancel' | 'SaveNotNeeded' via Promise} a
 * "void" promise is resolved when successfully complete
 * -or- 'UserCancel' when user cancels the request
 * -or- 'SaveNotNeeded' when save is not needed
 * 
 * @throws {Error} an Error is thrown in various unexpected scenarios.
 */
export async function savePkg(pkg, saveAs=false) {
  // validate parameters
  const check = verify.prefix('savePkg() parameter violation: ');

  // ... pkg
  check(pkg,                     'pkg is required')
  check(pkg instanceof SmartPkg, 'pkg must be a SmartPkg');

  // ... saveAs
  if (saveAs) {
    check(saveAs === true || saveAs === false, 'saveAs must be a boolean (when supplied)');
  }

  // insure we have access to the "Native File System API TRIAL"
  if (!window.chooseFileSystemEntries) {
    throw new Error('***ERROR*** savePkg() the "Native File System API TRIAL" is NOT available in this environment :-(')
      .defineAttemptingToMsg('save a package to a local file system');
  }

  // no-op when save operation that has NO changes
  if (!saveAs &&             // a save request
      pkg.pkgResourcePath && // that doesn't morph into a save-as
      pkg.isInSync()) {      // and it has NO changes
    return 'SaveNotNeeded';
  }

  // create the JSON content, representing our pkg
  // ... placement of this process is crucial - any unexpected errors
  //     occurring here will short-circuit the creation of an empty file!
  const smartJSON = pkg.toSmartJSON();
  const content   = JSON.stringify(smartJSON, null, 2); // TODO: parameterize pretty-print JSON

  // locate the file where the pkg will be saved
  let fileHandle = saveAs ? undefined : pkg.getPkgResourcePath();
  // ... conditionally prompt the user to select the file
  //     (either there is no `pkg.pkgResourcePath`, or a `saveAs` operation was requested)
  if (!fileHandle) {
    try {
      fileHandle = await window.chooseFileSystemEntries({
        type: 'saveFile',
        accepts: [{
          description: 'visualize-it file',
          extensions: ['vit'],
          mimeTypes: ['application/json'],
        }],
      });
    }
    catch (err) {
      // prune expected errors
      if (err.name === 'AbortError') { // ... user canceled request
        return 'UserCancel';
      }
      // re-throw "qualified" unexpected errors
      throw err.defineAttemptingToMsg(`select the file to save the "${pkg.getPkgName()}" package`);
    }
  }

  // write the file
  try {
    // create a writer (request permission if necessary)
    const writer = await fileHandle.createWriter();

    // write the content
    await writer.write(0, content);

    // close the file and write the contents to disk
    await writer.close();
  }
  catch(err) {
    // prune expected errors
    if (err.name === 'NotAllowedError') { // ... user did not allow the file write
      err.defineUserMsg('User disallowed the file write');
    }
    // re-throw "qualified" unexpected errors
    throw err.defineAttemptingToMsg(`save the "${pkg.getPkgName()}" package`);
  }

  // retain the pkgResourcePath
  pkg.setPkgResourcePath(fileHandle);

  // reset the pkg baseline crc (reflecting what has been filed)
  pkg.resetBaseCrc();
}


//******************************************************************************
//*** Specifications
//******************************************************************************

/**
 * @typedef {Unknown} PkgResourcePath
 *
 * PkgResourcePath is intended to be a generic abstraction that
 * encapsulates the resource path of where a SmartPkg is persisted
 * (either a file, or url, etc.).
 *
 * Currently it's type is limited to the FileSystemFileHandle _(a
 * Native File System type)_.
 * 
 * When a SmartPkg is persisted (i.e. pulled from, or saved to a
 * file/url), it will contain a pkgResourcePath.
 * - this merely identifies it's persistent form and provides a
 *   convenient means by which changes can be saved
 * - NOTE: the SmartPkg.pkgResourcePath attribute is NOT persisted,
 *         rather it is retained as a result of an open/save operation.
 *
 * AI: More research is needed to expand pkgResourcePath to it's more
 *     generic form.
 *     - regarding FileSystemFileHandle
 *       * it does not appear you can ascertain the internal actual local file name
 *         cannot glean path/directory ... only fileName (ex: 'textDat.txt')
 *         - fileHandle: {
 *             isDirectory: false
 *             isFile:      true
 *             name:        'testData.txt'
 *           }
 *         - file: {
 *             name:        'testData.txt'
 *             lastModified: 222333444
 *             webkitRelativePath: ''
 *             size:  123
 *             type: 'text/plain'
 *           }
 *         - there is a fileHandle = directoryHandle.getFile(name)
 *       * in it's early form, it is NOT YET serializable
 *       * unsure, but running from a PWA may help
 *       * there are TWO handle refs ... can be:
 *         - FileSystemFileHandle ........ handle.isFile
 *         - FileSystemDirectoryHandle ... handle.isDirectory
 *     - more broadly, how do we encapsulate both file and url usage (ultimately)
 */
