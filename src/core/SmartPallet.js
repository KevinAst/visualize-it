import SmartModel        from './SmartModel';
import verify            from '../util/verify';
import checkUnknownArgs  from '../util/checkUnknownArgs';

/**
 * SmartPallet is an abstract base class representing the graphical
 * perspective that visualizes a system (either in part or whole).
 */
export default class SmartPallet extends SmartModel {

  /**
   * Create a SmartPallet.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this pallet.
   * @param {string} [name=id] - the human interpretable name of this
   * pallet (DEFAULT to id).
   */
  constructor({id, name, ...unknownArgs}={}) {
    super({id, name});

    // validate SmartPallet() constructor parameters
    const check = verify.prefix('SmartPallet() constructor parameter violation: ');
    // ... id/name validated by base class
    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);
  }

  /**
   * Get self's current size (dynamically calculated).
   *
   * @returns {Size} self's current size ... {width, height}.
   */
  getSize() {
    throw new Error(`***ERROR*** SmartPallet pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.getSize() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Perform any static binding of self's size change (such as HTML or
   * Konva bindings).
   *
   * @param {Size} oldSize - the previous size ... {width, height}.
   * @param {Size} newSize - the new size ... {width, height}.
   */
  bindSizeChanges(oldSize, newSize) {
    throw new Error(`***ERROR*** SmartPallet pseudo-interface-violation [id:${this.id}]: ${this.diagClassName()}.bindSizeChanges() is an abstract method that MUST BE implemented!`);
  }

  /**
   * Translate the supplied DnD event's absolute page coordinates to
   * canvas coordinates for self's SmartPallet.
   *
   * This algorithm considers things like page offsets and content
   * scrolling.
   *
   * API: DnD
   *
   * @param {DnDEvent} event - the DnD event containing the absolute
   * coordinates.
   *
   * @returns {Coord} the translated coordinate ... {x, y}.
   */
  dndCanvasCoord(event) {
    // accumulate the page offsets and scrolling
    // ... Unlike the konva-based canvas, our viewContainer has the parentage
    //     we need to calculate offsets!
    //     MORE DETAIL:
    //     - The DnD event.target will be a canvas, however it has NO parentage
    //       (something related to Konva).
    //     - As a result, we calculate offsets from our viewContainer
    //       (i.e. self's SmartPallet).
    const viewContainer = this.getView().containingHtmlElm;
    const offset        = accumDomCoordOffset(viewContainer);

    // return the canvas coordinate
    // ... a combination of the event's absolute x/y, adjusted by our offset
    return {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
  }

}
SmartPallet.unmangledName = 'SmartPallet';


// recursive helper function of dndCanvasCoord() method
function accumDomCoordOffset(elm, offsetCoord={x:0, y:0}) {

  // account for offsets
  if (elm.offsetLeft)
    offsetCoord.x += elm.offsetLeft;
  if (elm.offsetTop)
    offsetCoord.y += elm.offsetTop;

  // account for scrolling
  if (elm.scrollLeft)
    offsetCoord.x -= elm.scrollLeft;
  if (elm.scrollTop)
    offsetCoord.y -= elm.scrollTop;

  // recurse up parent chain
  if (elm.parentNode) {
    return accumDomCoordOffset(elm.parentNode, offsetCoord);
  }

  // that's all folks
  return offsetCoord;
}
