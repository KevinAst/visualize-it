import Collage        from './Collage';
import PseudoClass    from './PseudoClass';
import Scene          from './Scene';
import CompRef        from './CompRef';
import SmartPkg,
       {PkgTreeDir,
        PkgTreeEntry} from './SmartPkg';
import SmartView      from './SmartView';
import pkgManager     from './pkgManager';

// register our system classes that resolves the core classes
// ... needed for resource-based rehydration (i.e. persistance)
// ... only core "concrete" classes that live in SmartPkgs are registered!
//     - the advantage of NOT registering abstract classes is:
//         it further highlights missing "unmangledName" class registrations,
//         manifest in a persistance rehydration attempt to instantiate 
//         a "non registered" SmartModel (as an example)

// PkgManager                                 // NOT: a service object NOT part of our persistent object model
pkgManager.registerSystemClass(PseudoClass);
pkgManager.registerSystemClass(Collage);
pkgManager.registerSystemClass(Scene);
pkgManager.registerSystemClass(CompRef);
// SmartComp                                  // NOT: an abstract class (see docs above)
// SmartModel                                 // NOT: an abstract class (see docs above)
pkgManager.registerSystemClass(SmartPkg);     // the root of our persistent model
pkgManager.registerSystemClass(PkgTreeDir);
pkgManager.registerSystemClass(PkgTreeEntry);
// SmartPallet                                // NOT: an abstract class (see docs above)
pkgManager.registerSystemClass(SmartView);
