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
   * scene (DEFAULT to id).
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
   * Mount the visuals of this SmartScene, binding the graphics to the
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
   * Get self's current size (dynamically calculated).
   *
   * @returns {Size} self's current size ... {width, height}.
   */
  getSize() {
    throw new Error(`***ERROR*** SmartScene pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.getSize() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Perform any static binding of self's size change (such as HTML or
   * Konva bindings).
   *
   * @param {Size} oldSize - the previous size ... {width, height}.
   * @param {Size} newSize - the new size ... {width, height}.
   */
  bindSizeChanges(oldSize, newSize) {
    throw new Error(`***ERROR*** SmartScene pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.bindSizeChanges() is an abstract method that MUST BE implemented!`);
  }

}
SmartScene.unmangledName = 'SmartScene';
