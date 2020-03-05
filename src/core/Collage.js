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
   * @param {SceneCtxArr} scenes - the scenes/positions visualized by this collage.
   * ... where SceneCtxArr: `[ { scene: Scene, pos: {x,y} }, ... ]` ?? REFACTOR: use pure scenes after refactor of scenes to accept x/y
   */
  constructor({id, name, scenes, ...unknownArgs}={}) {
    super({id, name});

    // validate Collage() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}(id:'${id}', name:'${name}') constructor parameter violation: `);

    // ... id/name validated by base class

    // ... scenes
    // ?? REFACTOR: use pure scenes after refactor of scenes to accept x/y
    check(scenes,                 'scenes is required');
    check(Array.isArray(scenes),  'scenes must be a SceneCtxArr');
    scenes.forEach( (sceneCtx, indx) => {
      check(sceneCtx.scene instanceof Scene,      `scenes[${indx}].scene must be a Scene instance`);
      check(sceneCtx.pos,                         `scenes[${indx}].pos is required`);
      check(Number.isInteger(sceneCtx.pos.x) &&
            sceneCtx.pos.x >= 0,                  `scenes[${indx}].pos.x must be a positive/zero integer, not: ${sceneCtx.pos.x}`);
      check(Number.isInteger(sceneCtx.pos.y) &&
            sceneCtx.pos.y >= 0,                  `scenes[${indx}].pos.y must be a positive/zero integer, not: ${sceneCtx.pos.y}`);
    });

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain derivation-specific parameters in self
    this.scenes = scenes;
    // TODO: need mucho validation and/or a real SceneCtx structure ?? REFACTOR: use pure scenes after refactor of scenes to accept x/y
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
    this.scenes.forEach( (scene) => scene.scene.konvaLayer.draggable(false) );
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {
    // draggable: enable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.scene.konvaLayer.draggable(true) );
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // draggable: disable (propagate into each top-level scene)
    this.scenes.forEach( (scene) => scene.scene.konvaLayer.draggable(false) );
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
    // propagate this request to each of our scenes (one canvas per scene)
    // ?? OLD: currently still a sceneCtx ... scene.pos will be eventually be obsoleted
    this.scenes.forEach( (scene) => scene.scene.mount(containingKonvaStage, scene.pos.x, scene.pos.y) );
    // ?? NEW: once we remove the Ctx
    //? this.scenes.forEach( (scene) => scene.mount(containingKonvaStage) );
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
      // ?? OLD: currently still a sceneCtx
      const sceneSize = scene.scene.size();
      accum.width  = Math.max(accum.width,  scene.pos.x + sceneSize.width); 
      accum.height = Math.max(accum.height, scene.pos.y + sceneSize.height);
      // ?? NEW: once we remove the Ctx
      //? const sceneSize = scene.size();
      //? accum.width  = Math.max(accum.width,  scene.x + sceneSize.width); 
      //? accum.height = Math.max(accum.height, scene.y + sceneSize.height);
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
      this.scenes.forEach( (scene) => scene.scene.draggable(draggable) );
      return this;                       // return self (for chaining)
    }
  }

}
Collage.unmangledName = 'Collage';
