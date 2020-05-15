import PkgViewer, {viewPkg}   from './PkgViewer.svelte';
import {registerLeftNavEntry} from '../appLayout';

// pseudo-feature initialization:
// ...  register self's component (PkgViewer) to the LeftNav
registerLeftNavEntry(PkgViewer);

// publicly promote the pkgViewer's API
export {
  viewPkg,  // + viewPkg(pkg): void ... makes pkg visible in PkgViewer/LeftNav
};
