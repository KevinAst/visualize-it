import Konva             from 'konva';
import SmartModel        from './SmartModel';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import {isNumber}        from 'util/typeCheck';
import DispMode          from './DispMode';

/**
 * SmartComp is the abstract base class for all visualize-it
 * components.
 *
 * These are graphical representations of components found in a system:
 *
 *  - they bind to a data model (for visual affects and animation)
 *
 *  - their graphics are atomically managed (selection and transformation)
 *    ... using a single rooted Konva.Group
 *
 *  - NOTE: SmartComp is abstract requiring derivation (for code-based compPkgs)
 *          HOWEVER: there is a concrete derivation that supports 
 *                   dynamic-based resource-loaded compPkgs
 *                   (maintained by the visualize-it component editor)
 *  
 *                 SmartComp        ... abstract
 *             isA  ├── DynamicComp ... a concrete derivation for dynamic-based resource-loaded compPkgs
 *                  │                   ... managed by the visualize-it component editor
 *                  └── others      ... for code-based compPkgs
 */
export default class SmartComp extends SmartModel {

  /**
   * Create a SmartComp.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this component.
   * @param {string} [name=id] - the human interpretable name of this
   * component (DEFAULT to id). // ?? UNSURE if we want to DEFAULT this way
   *
   * @param {number} [x=0] - the optional x offset within it's container (used in transformations of Scene container)
   * @param {number} [y=0] - the optional y offset within it's container (used in transformations of Scene container)
   * @param {number} [rotation=0] - the optional rotation within it's container (used in transformations of Scene container)
   * @param {number} [scaleX=0] - the optional scaleX within it's container (used in transformations of Scene container)
   * @param {number} [scaleY=0] - the optional scaleY within it's container (used in transformations of Scene container)
   */
  constructor({id, name, x=0, y=0, rotation=0, scaleX=1, scaleY=1, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartComp() constructor parameters
    const check = verify.prefix('SmartComp() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... x
    check(isNumber(x), `x must be a number (when supplied), NOT: ${x}`);
    // ... y
    check(isNumber(y), `y must be a number (when supplied), NOT: ${y}`);
    // ... rotation
    check(isNumber(rotation), `rotation must be a number (when supplied), NOT: ${rotation}`);
    // ... scaleX
    check(isNumber(scaleX), `scaleX must be a number (when supplied), NOT: ${scaleX}`);
    // ... scaleY
    check(isNumber(scaleY), `scaleY must be a number (when supplied), NOT: ${scaleY}`);
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    // retain parameters in self
    this.x        = x;
    this.y        = y;
    this.rotation = rotation;
    this.scaleX   = scaleX;
    this.scaleY   = scaleY;
  }

  // support persistance by encoding needed props of self
  getEncodingProps() {
    return [...super.getEncodingProps(), ...['x', 'y', 'rotation', 'scaleX', 'scaleY']];
  }

  /**
   * Return an indicator as to whether self supports the supplied `dispMode`.
   *
   * @param {DispMode} dispMode - the display mode to evaluate.
   *
   * @throws {boolean} true: can handle, false: not supported.
   */
  canHandleDispMode(dispMode) {
    return dispMode !== DispMode.edit; // by default, SmartComps cannot be edited
  }

  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    // L8TR: do something when animate is supported
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // L8TR: do something when animate is supported
  }

  /**
   * Mount the visuals of this component, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Layer} containingKonvaLayer - The container of
   * this component (a Konva.Layer).
   */
  mount(containingKonvaLayer) {
    // create our top-level group containing our component sub-shapes
    // ... this is an expected setup to allow components to be treated as an atomic unit
    this.compGroup = new Konva.Group({
      id: this.id,
      x:  this.x,
      y:  this.y,
      rotation: this.rotation,
      scaleX:   this.scaleX,
      scaleY:   this.scaleY,
    });
    containingKonvaLayer.add(this.compGroup);
  }

}
SmartComp.unmangledName = 'SmartComp';
