import SmartModel        from './SmartModel';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';

/**
 * SmartScene is an abstract base class representing the graphical
 * perspective that visualizes a system (either in part or whole).
 */
export default class SmartScene extends SmartModel {

  /**
   * Create a SmartScene.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this scene.
   * @param {string} [name=id] - the human interpretable name of this
   * scene (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   */
  constructor({id, name, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartScene() constructor parameters
    const check = verify.prefix('SmartScene() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
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
    throw new Error(`***ERROR*** SmartScene pseudo-interface-violation: ${this.diagClassName()}(id:${this.id}).mount() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Get/Set self's size ... {width, height}.
   *
   * @param {Size} [size] - the optional size that when
   * supplied will set self's size (only for Scene - NOT Collage objects).
   *
   * @returns {Size|self} for getter: our current size,
   * for setter: self (supporting chainable setters).
   */
  size(size) {
    throw new Error(`***ERROR*** SmartScene pseudo-interface-violation: ${this.diagClassName()}(id:${this.id}).size() is an abstract method that MUST BE implemented!`);
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
  draggable(draggable) {
    throw new Error(`***ERROR*** SmartScene pseudo-interface-violation: ${this.diagClassName()}(id:${this.id}).draggable() is an abstract method that MUST BE implemented!`);
  }
}
SmartScene.unmangledName = 'SmartScene';
