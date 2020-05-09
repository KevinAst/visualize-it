import Collage     from './Collage';
import PseudoClass from './PseudoClass';
import Scene       from './Scene';
import SmartPkg    from './SmartPkg';
import SmartView   from './SmartView';
import pkgManager  from './pkgManager';

// register a silent package that resolves the core classes
// ... needed for resource-based rehydration (i.e. persistance)
// ... only core "concrete" classes that live in SmartPkgs are registered!
//     - the advantage of NOT registering abstract classes is:
//         it further highlights missing "unmangledName" class registrations,
//         manifest in a persistance rehydration attempt to instantiate 
//         a "non registered" SmartModel (as an example)
pkgManager.registerPkg( new SmartPkg({
  id:   'core',
  name: 'core classes',
  entries: {
    core: [
      Collage,
//    PkgManager,       NOT: a service object NOT part of our persistent object model
      PseudoClass,
      Scene,
//    SmartComp,        NOT: an abstract class (see docs above)
//    SmartModel        NOT: an abstract class (see docs above)
      SmartPkg,      // the root of our persistent model
//    SmartPallet,      NOT: an abstract class (see docs above)
      SmartView,
    ],
  },
}) );
