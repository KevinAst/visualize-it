import SmartScene        from './SmartScene';
import Scene             from './Scene';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * Collage is a SmartScene derivation in which multiple Scenes are displayed/visualized.
 */
export default class Collage extends SmartScene {

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
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['scenes']];
  }

  
  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   */
  enableViewMode() {
    // draggable: disable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.konvaLayer.draggable(false) );

    // clear events from edit mode (if any)
    this.containingKonvaStage.off('dragend');
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {
    // draggable: enable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.konvaLayer.draggable(true) );

    // monitor events at the Konva Stage level (using Event Delegation and Propagation)
    // ... dragend: monitor x/y changes - syncing KonvaLayer INTO our Scene SmartObject
    this.containingKonvaStage.off('dragend'); // clear events to handle back-to-back edits
    this.containingKonvaStage.on('dragend', (e) => {
      // console.log(`xx Konva Stage dragend: index: ${e.target.index}, id: ${e.target.id()}, name: ${e.target.name()} x: ${e.target.x()}, y: ${e.target.y()} ... e:\n`, e);

      // locate our scene matching the target Konva.Layer
      // ... we correlate the id's between Konva/SmartObject
      const scene = this.scenes.find( (scene) => scene.id === e.target.id() );
      // console.log(`xx Konva Stage dragend: matching scene: `, scene);

      // sync the modified x/y
      scene.x = e.target.x();
      scene.y = e.target.y();
    });
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // draggable: disable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.konvaLayer.draggable(false) );

    // clear events from edit mode (if any)
    this.containingKonvaStage.off('dragend');
  }

  /**
   * Mount the visuals of this collage, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Stage} containingKonvaStage - The container of
   * this scene (a Konva.Stage).
   */
  mount(containingKonvaStage) {
    // retain containingKonvaStage for event handling
    this.containingKonvaStage = containingKonvaStage;

    // propagate this request to each of our scenes (one canvas per scene)
    this.scenes.forEach( (scene) => scene.mount(containingKonvaStage) );
  }


  /**
   * Get self's size ... {width, height}.
   *
   * NOTE: Because the collage size is derived from it's contained scenes, 
   *       you may only set the size within the Scene object (where it is mastered).
   *
   * @returns {Size} our current size.
   */
  size(size) {
    // NOTE: this method does NOT require mounting, because it's contained scene's masters the size!
    verify(size===undefined, `***ERROR*** ${this.diagClassName()}.size() can only be invoked as a getter (with no params) ... size is mastered in the scene, AND derived in the collage.`);

    // compute our size accumulated from all our scenes
    const viewSize = this.scenes.reduce( (accum, scene) => {
      const sceneSize = scene.size();
      accum.width  = Math.max(accum.width,  scene.x + sceneSize.width); 
      accum.height = Math.max(accum.height, scene.y + sceneSize.height);
      return accum;
    }, {width:0, height:0});
    return viewSize;
  }

  /**
   * Get/set our draggable scene flag.
   *
   * @param {boolean} [draggable] - the optional setting that when
   * supplied will set the scene's draggability.
   *
   * @returns {boolean|self} for getter: our current draggable
   * setting, for setter: self (supporting chainable setters).
   */
  // AI: OBSOLETE (based on current enableXxxMode() implementation)
  draggable(draggable) {
    // NOTE: checkMounted() is accomplished at the Scene level
    if (draggable===undefined) {         // getter:
      return this.scenes[0].draggable(); // return boolean setting of our first scene (assumes it is synced)
    }
    else {                               // setter: sets across all our scenes
      this.scenes.forEach( (scene) => scene.draggable(draggable) );
      return this;                       // return self (for chaining)
    }
  }

}
Collage.unmangledName = 'Collage';
