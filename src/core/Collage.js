import SmartPallet       from './SmartPallet';
import Scene             from './Scene';
import verify            from '../util/verify.js';
import checkUnknownArgs  from '../util/checkUnknownArgs';

/**
 * Collage is a SmartPallet derivation in which multiple Scenes are displayed/visualized.
 */
export default class Collage extends SmartPallet {

  /**
   * Create a Collage.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this  collage.
   * @param {string} [name=id] - The name of this collage (DEFAULT to id).
   * @param {Scene[]} scenes - the scenes visualized by this collage.
   */
  constructor({id, name, scenes, ...unknownArgs}={}) {
    super({id, name});

    // validate Collage() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... scenes
    check(scenes,                 'scenes is required');
    check(Array.isArray(scenes),  'scenes must be an Scene[] array');
    scenes.forEach( (scene, indx) => {
      check(scene instanceof Scene, `scenes[${indx}] must be a Scene instance`);
    });

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    this.scenes = scenes;

    // maintain our parentage
    this.scenes.forEach( (scene) => scene.setParent(this) );
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['scenes']];
  }

  /**
   * Promote the material icon "name" representing self's OO classification.
   */
  getIconName() {
    return 'filter'; // ALSO CONSIDER: dynamic_feed
  }
  
  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    // clear everything from any of the other DispModes
    // ... sequentially follow each item in the "other" DispModes
    this.scenes.forEach( (scene) => scene.konvaSceneLayer.draggable(false) );
    this.containingKonvaStage.off('dragend');
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {
    // draggable: enable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.konvaSceneLayer.draggable(true) );

    // monitor events at the Konva Stage level (using Event Delegation and Propagation)
    // ... dragend: monitor x/y changes - syncing KonvaLayer INTO our Scene SmartObject
    this.containingKonvaStage.on('dragend', (e) => {

      // locate our scene matching the event target Konva.Layer
      // ... we correlate the id's between Konva/SmartObject
      const konvaObj = e.target;
      const id       = konvaObj.id();
      const scene    = this.scenes.find( (scene) => scene.id === id );
      // console.log(`xx Konva Stage dragend: index: ${konvaObj.index}, id: ${konvaObj.id()}, name: ${konvaObj.name()} x: ${konvaObj.x()}, y: ${konvaObj.y()} ... e:\n`, {e, scene});

      // helpers to service undo/redo
      // IMPORTANT: all updates must be written in such a way that DOES NOT reference stale objects
      //            - when using undo/redo (over the course of time) objects may be "swapped out" via the synchronization process
      //            - SOLUTION: resolve all objects from the "id" string AT RUN-TIME!!
      const oldLoc = {
        x: scene.x,
        y: scene.y
      };
      const newLoc = {
        x: konvaObj.x(),
        y: konvaObj.y()
      };
      const syncSmartObject = (loc) => {
        const scene = this.scenes.find( (scene) => scene.id === id );
        scene.x = loc.x;
        scene.y = loc.y;
        return scene;
      }
      const syncKonva = (loc) => {
        const konvaObj = this.containingKonvaStage.findOne(`#${id}`);
        konvaObj.x(loc.x);
        konvaObj.y(loc.y);
        this.containingKonvaStage.draw();
      }

      // apply our change
      // ... should be able to OMIT `.getPkgEntry()` node (below) BECAUSE this Collage should always be a PkgEntry
      this.getPkgEntry().changeManager.applyChange({
        changeFn(redo) {
          const scene = syncSmartObject(newLoc);
          redo && syncKonva(newLoc);
          return scene;
        },
        undoFn() {
          const scene = syncSmartObject(oldLoc);
          syncKonva(oldLoc);
          return scene;
        }
      });

    });
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // yet to do
  }

  /**
   * Mount the visuals of this collage, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Stage} containingKonvaStage - The container of
   * this collage (a Konva.Stage).
   */
  mount(containingKonvaStage) {
    // retain containingKonvaStage for event handling
    this.containingKonvaStage = containingKonvaStage;

    // propagate this request to each of our scenes (one canvas per scene)
    this.scenes.forEach( (scene) => scene.mount(containingKonvaStage) );
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
   * Unmount the visuals of this collage, unbinding the graphics to the
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
    this.scenes.forEach( (scene) => scene.unmount(konvaPreDestroyed) );
  }

  /**
   * Replace self's child reference, defined by the specified params.
   *
   * @param {any} oldRef - the existing child to be replaced with
   * `newRef`.
   *
   * @param {any} newRef - the new child to replace `oldRef`.
   */
  childRefChanged(oldRef, newRef) {
    const indx = this.scenes.indexOf(oldRef);
    if (indx !== -1) {
      // console.log(`xx Collage.childRefChanged() ... replacing indx: ${indx}\n`, {oldRef, newRef});
      this.scenes[indx] = newRef;
    }
    else {
      const msg = `***ERROR*** ${this.diagClassName()}.childRefChanged() [id:${this.id}]: could NOT find oldRef to replace (see logs for details)`;
      console.error(msg+'\n', {oldRef, newRef});
      throw new Error(msg);
    }
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

    // compute size
    if (this.isMounted()) { // ... when mounted
      // dynamically accumulate the size from our scenes
      this.sizeCache = this.scenes.reduce( (accum, scene) => {

        // recalculate this scene size
        // KEY: we force the scene to recalculate it's size
        //      ... by clearing it's sizeCache
        //      BECAUSE our sizeCache has NOT been established (see above)
        //      ... either first time, or something has changed
        scene.sizeCache = undefined;
        const sceneSize = scene.getSize();

        // accumulate this scene size
        // ... NOTE: the sceneSize already contains the scene.x/y offset
        accum.width  = Math.max(accum.width,  sceneSize.width); 
        accum.height = Math.max(accum.height, sceneSize.height);
        return accum;
      }, {width:100, height:100}); // ... minimum size
    }
    else { // ... when NOT mounted
      // provide initial size approximation (will be re-set when mounted)
      // ... AI: depending on initial flicker (of size changing when mounted)
      //         - OP1: persist the sizeCache
      //                ... although doesn't help component classes (the class may contain an .approxSize property)
      //         - OP1: hide content till fully mounted
      //         - OP2: some polymorphic API for initialSize()/approxSize()/guesstimateSize()
      //                ... UNSURE: in what object ... more research needed
      this.sizeCache = {width: 200, height: 200};
    }

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
    // propagate this to our scenes
    // ... not really needed because our Scene currently no-ops (but that's OK)
    this.scenes.forEach( (scene) => scene.bindSizeChanges(oldSize, newSize) );
  }

}
Collage.unmangledName = 'Collage';
