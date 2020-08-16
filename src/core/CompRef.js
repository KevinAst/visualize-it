import SmartPallet          from './SmartPallet';
import Scene                from './Scene';
import SmartClassRef        from './SmartClassRef';
import {containerSizeFudge} from './konvaUtil';

import verify               from '../util/verify';
import checkUnknownArgs     from '../util/checkUnknownArgs';


/**
 * CompRef (a SmartPallet derivation) is a component classRef
 * container that can be packaged (in SmartPkg) and
 * displayed/visualized.  It wraps either a real class [a SmartComp
 * derivation], or a resource-based pseudoClass [a DynamicComp].
 */
export default class CompRef extends SmartPallet {

  /**
   * Create a CompRef.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this compRef.
   * @param {string} [name=id] - The name of this compRef (DEFAULT to id).
   * @param {SmartClassRef} compClassRef - the compClassRef visualized by this
   * compRef.
   */
  constructor({id, name, compClassRef, ...unknownArgs}={}) {
    super({id, name});

    // validate CompRef() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... compClassRef
    check(compClassRef,                          'compClassRef is required');
    check(compClassRef instanceof SmartClassRef, 'compClassRef must be a SmartClassRef type');

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    // this.compClassRef = compClassRef; // ... currently no need for this


    //***
    //*** establish the structure that gives visibility to our component
    //*** ... a scene with a single component in it
    //***

    // instantiate a single component from self's class
    // ... this is what we will visualize :-)
    const compName = compClassRef.getClassName();
    this.comp      = compClassRef.createSmartObject({id: `comp-${compName}`, // I think we are OK ... hopefully no other param context is needed
                                                     x:  containerSizeFudge,
                                                     y:  containerSizeFudge});

    // wrap our single component in a scene (see NOTE above)
    this.scene = new Scene({
      id: `view-${compName}`,
      comps: [this.comp],
    });

    // maintain our parentage
    // ... our comp parentage is maintained by the Scene constructor (above)
    this.scene.setParent(this);
  }

  /**
   * Return the component instance being visualized.  This API is
   * specific to CompRef.  It is promoted as the target of our
   * visualized tab (see: TabControllerCompRef).
   *
   * @returns {SmartComp} the component instance being visualized via
   * this CompRef.
   */
  getCompInstance() {
    return this.comp;
  }

  // support persistance by encoding needed props of self
  getEncodingProps() { 
    // AI: currently class-based CompRef are NOT persisted
    //     ... hard-coded assumption (as of now) found in SmartPkg.canPersist()
    //     ... we will have to deal with persistence once we introduce resource-based DynamicComp pseudoClass
    //     ... SOOOO, technically this method is NEVER executed 
    //         it would not work with compClassRef
    return [...super.getEncodingProps(), ...['compClassRef']];
  }

  
  /**
   * Mount the visuals of this compRef, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Stage} containingKonvaStage - The container of
   * this compRef (a Konva.Stage).
   */
  mount(containingKonvaStage) {
    // retain containingKonvaStage for event handling
    this.containingKonvaStage = containingKonvaStage;

    // propagate this request to our contained scene
    this.scene.mount(containingKonvaStage);
  }

  /**
   * Return an indicator as to whether self is mounted (i.e. bound to the Konva graphics).
   *
   * @returns {boolean} `true`: self is mounted, `false` otherwise
   */
  isMounted() {
    return this.containingKonvaStage ? true : false;
  }

  /**
   * Unmount the visuals of this compRef, unbinding the graphics to the
   * underlying canvas.
   *
   * @param {boolean} [konvaPreDestroyed=false] - an internal
   * parameter that indicates if konva nodes have already been
   * destroyed (when a parent Konva.Node has already issued the
   * konvaNode.destroy()).
   */
  unmount(konvaPreDestroyed=false) {
    // clear our konva state (established in our mount())
    this.containingKonvaStage = null;
    
    // propagate request into our children
    this.scene.unmount(konvaPreDestroyed);
  }


  /**
   * Get self's current size (dynamically calculated).
   *
   * @returns {Size} self's current size ... {width, height}.
   */
  getSize() {
    // cached size takes precedence
    // ... this sizeCache will be re-set whenever size has the potential of changing:
    //     - both in our initial mount (replacing "approximation" with "exact" size)
    //     - and during interactive edit changes (reflecting an updated size)
    // ... see: SmartModel.trickleUpChange()
    if (this.sizeCache) {
      return this.sizeCache;
    }

    // recalculate our size
    // KEY: we force the scene to recalculate it's size
    //      ... by clearing it's sizeCache
    //      BECAUSE our sizeCache has NOT been established (see above)
    //      ... either first time, or something has changed
    this.scene.sizeCache = undefined;
    this.sizeCache = this.scene.getSize(); // propagate this request to our contained scene
    return this.sizeCache;
  }

  /**
   * Perform any static binding of self's size change (such as HTML or
   * Konva bindings).
   *
   * @param {Size} oldSize - the previous size ... {width, height}.
   * @param {Size} newSize - the new size ... {width, height}.
   */
  bindSizeChanges(oldSize, newSize) {
    // propagate this request to our contained scene
    this.scene.bindSizeChanges(oldSize, newSize);
  }

}
CompRef.unmangledName = 'CompRef';
