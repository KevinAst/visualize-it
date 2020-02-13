import Collage     from './Collage';
import PseudoClass from './PseudoClass';
import Scene       from './Scene';
import SmartComp   from './SmartComp';
import SmartPkg    from './SmartPkg';
import SmartScene  from './SmartScene';
import SmartView   from './SmartView';
import pkgManager  from './PkgManager';

// register a silent package that resolves the core classes
// ... needed for resource-based rehydration (i.e. persistance)
// ... only core "concrete" classes that live in SmartPkgs are registered!
pkgManager.registerPkg( new SmartPkg({
  id:   'core',
  name: 'core classes',
  entries: {
    core: [
      Collage,
      PseudoClass,
      Scene,
      SmartComp,
      SmartPkg,
      SmartScene,
      SmartView,
    ],
  },
}) );
