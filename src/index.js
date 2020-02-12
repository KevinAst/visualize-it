import 'util/ErrorExtensionPolyfill';
import 'core/SmartPkg';      // see "Resolve Circular Dependency" below
export {default} from 'app'; // redirect to app.js

/*
  ***********************************
  *** Resolve Circular Dependency ***
  ***********************************

  Because SmartPkg extends SmartModel, and SmartModel uses PkgManager,
  which in turn relies on SmartPkg ... 

  >>> SmartPkg must be expanded FIRST
      AI: By modeling PkgManger.loadPkg() elsewhere, we MAY get around
          this circular dependency
*/

