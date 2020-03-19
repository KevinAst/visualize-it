import Konva             from 'konva';
import PseudoClass       from './PseudoClass';
import SmartScene        from './SmartScene';
import {ancestorOfLayer} from './konvaUtil';
import verify            from 'util/verify';
import checkUnknownArgs  from 'util/checkUnknownArgs';
import {isNumber}        from 'util/typeCheck';
import {toast}           from 'util/notify';

/**
 * Scene is a SmartScene derivation that models a single Scene to be
 * displayed/visualized.
 *
 * A Scene represents a graphical perspective that visualizes a system
 * (either in part or whole).
 *
 * - a scene contains visual components, arranged in a way that
 *   resembles a system
 *
 * - a scene can DIRECTLY mange it's x/y properties (this is used in
 *   the context of a Collage, where multiple scenes are offset within
 *   a viewport).
 *
 * - different scenes may visualize various aspects of a system (for
 *   example a functional breakdown)
 *   * each scene INTERNALLY correlates to a separate Konva.Layer
 *
 * - FUTURE: support of user-defined functional layers:
 *   - scene may be further sub-divided into MULTIPLE functional layers
 *   - components of a scene will belong to one of these functional layers
 *     ... Quest: is this a direct containment, or some logical tagging?
 *   - this allows the visualization of these functional layers to be toggled on/off
 *
 * - FUTURE: Animation Consideration:
 *   - internally each scene (and their functional layers) is
 *     sub-divided into two Konva layers:
 *     - a static layer
 *     - an animation layer
 *     > NEEDS WORK: may want to do things in our static layer (like change component color)
 *
 * **NOTE**: Scene objects are pseudoClasses.  In other words Scene
 *           instances are considered logical types.  Take for example
 *           `Foo`: a Scene instance with an id of `Foo`.  The master
 *           `Foo` object can be defined and edited, however `Foo`
 *           instances (copies of the `Foo` object) may be may created
 *           and referenced many times within the various Collages.
 */
export default class Scene extends SmartScene {

  /**
   * Create a Scene.
   *
   * **Please Note** this constructor uses named parameters.
   *
   * @param {string} id - the unique identifier of this scene.
   * @param {string} [name=id] - the human interpretable name of this
   * scene (DEFAULT to id).
   *
   * @param {int} [x=0] - the optional x offset of this scene within it's container (used by Collage container - managing multiple Scenes)
   * @param {int} [y=0] - the optional y offset of this scene within it's container (used by Collage container - managing multiple Scenes)
   *
   * @param {SmartComp[]} comps - the set of components (SmartComp) that 
   * make up this scene (logically our display list).
   */
  constructor({id,
               name,
               x=0,
               y=0,
               comps,
               ...unknownArgs}={}) {

    super({id, name});

    // validate Scene() constructor parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);

    // ... id/name validated by base class

    // ... comps
    check(comps,                'comps is required');
    check(Array.isArray(comps), 'comps must be a SmartComp[] array');

    // ... x
    check(isNumber(x), `x must be a number (when supplied), NOT: ${x}`);

    // ... y
    check(isNumber(y), `y must be a number (when supplied), NOT: ${y}`);

    // ... unknown arguments
    checkUnknownArgs(check, unknownArgs, arguments);

    //***
    //*** maintain self state (instance vars)
    //***

    // Scene objects are pseudoClasses (see NOTE above)
    this.pseudoClass = new PseudoClass();

    // retain parameters in self
    this.x     = x;
    this.y     = y;
    this.comps = comps;

    // maintain our parentage
    this.comps.forEach( (comp) => comp.setParent(this) );
  }

  // support persistance by encoding needed props of self
  getEncodingProps(forCloning) {

    // define our "baseline"
    const encodingProps = [['x',0], ['y',0]];

    // conditionally include non-temporal props:
    // - for pseudoClass MASTERs
    // - for cloning operations
    // ... see JavaDoc for: SmartModel.getEncodingProps()
    if (this.pseudoClass.isType() || forCloning) {
      encodingProps.push('comps');
    }

    return [...super.getEncodingProps(forCloning), ...encodingProps];
  }      
  
  /**
   * Enable self's "view" DispMode (used in top-level objects targeted by a tab).
   *
   * NOTE: this is also invoked prior to other display modes, as a neutral reset :-)
   */
  enableViewMode() {
    // clear everything from any of the other DispModes
    // ... sequentially follow each item in the "other" DispModes
    this.konvaSceneLayer.getChildren().each( (konvaComp, n) => konvaComp.draggable(false) );
    this.konvaSceneLayer.off('dragend');
    this.containingKonvaStage.off('click tap');
    this.containingKonvaStage.find('Transformer').destroy(); // remove any outstanding transformers
    this.konvaSceneLayer.getChildren().each( (konvaComp, n) => konvaComp.off('transformend') );
    this.konvaSceneLayer.draw();
  }

  /**
   * Enable self's "edit" DispMode (used in top-level objects targeted by a tab).
   */
  enableEditMode() {

    // prevent edit mode when containing package cannot be persisted
    // ... ex: when the package contains code
    const pkg = this.getPackage();
    if (!pkg.canPersist()) {
      toast.warn({msg: `The "${this.getName()}" scene is NOT EDITABLE ` + 
                       `... normally scenes can be edited, however it belongs to the "${pkg.getPkgName()}" package which ` +
                       `contains code (therefore you would not be able to save your changes).`});
      return;
    }

    //***
    //*** enable dragging ... to all top-level konvaComps
    //***

    // draggable: enable (propagate into each top-level shape/group)
    this.konvaSceneLayer.getChildren().each( (konvaComp, n) => konvaComp.draggable(true) );

    // monitor events at the Konva Scene Layer level (using Event Delegation and Propagation)
    // ... dragend: monitor x/y changes - syncing KonvaLayer INTO our Scene SmartObject
    this.konvaSceneLayer.on('dragend', (e) => {
      // console.log(`xx Konva Scene Layer dragend: index: ${e.target.index}, id: ${e.target.id()}, name: ${e.target.name()} x: ${e.target.x()}, y: ${e.target.y()} ... e:\n`, e);

      // locate our component matching the target Konva.Group
      // ... we correlate the id's between Konva/SmartObject
      const comp = this.comps.find( (comp) => comp.id === e.target.id() );
      // console.log(`xx Konva Scene Layer dragend: matching comp: `, comp);

      // sync Konva changes to Object Model
      comp.x = e.target.x();
      comp.y = e.target.y();

      // sync any container size changes
      this.regenSizeTrickleUp();
    });


    //***
    //*** enable transformations ... to all top-level konvaComps
    //***

    // monitor component selection via click events
    // NOTE: a click event will not trigger on Layer but on the Stage object instead
    //       ... see: https://konvajs.org/docs/events/Stage_Events.html
    this.containingKonvaStage.on('click tap', (e) => {

      // console.log(`xx TRANSFORM: target:\n`, e.target);

      // on void click: remove all transformers
      if (e.target === this.containingKonvaStage) {
        this.containingKonvaStage.find('Transformer').destroy();
        this.konvaSceneLayer.draw();
        return;
      }

      // remove old transformers
      this.containingKonvaStage.find('Transformer').destroy();

      // our real target it the top-level group (the konva representation of our component)
      const konvaComp = ancestorOfLayer(e.target);

      // create/manage new transformer
      var transformer = new Konva.Transformer();
      this.konvaSceneLayer.add(transformer);
      transformer.attachTo(konvaComp);
      this.konvaSceneLayer.draw();

      // sync Konva changes to Object Model
      konvaComp.on('transformend', (e) => { // ... NOTE: updates x/y/rotation/scaleX/scaleY ... NOT width/height at all
        // locate our component matching the target Konva.Group
        // ... we correlate the id's between Konva/SmartObject
        const comp = this.comps.find( (comp) => comp.id === e.target.id() );
        // console.log(`xx Konva Scene Layer transformend: x: ${e.target.x()}, y: ${e.target.y()}, rotation: ${e.target.rotation()}, scaleX: ${e.target.scaleX()}, scaleY: ${e.target.scaleY()},  ... matching comp: `, comp);

        // sync the modified x/y/rotation/scaleX/scaleY
        comp.x        = e.target.x();
        comp.y        = e.target.y();
        comp.rotation = e.target.rotation();
        comp.scaleX   = e.target.scaleX();
        comp.scaleY   = e.target.scaleY();
      });

      // sync any container size changes
      this.regenSizeTrickleUp();
    });
  }

  /**
   * Enable self's "animate" DispMode (used in top-level objects targeted by a tab).
   */
  enableAnimateMode() {
    // yet to do
  }

  
  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.konvaSceneLayer, `${this.diagClassName()}.${method}() can only be invoked after mounting.`);
  }

  /**
   * Mount the visuals of this scene, binding the graphics to the
   * underlying canvas.
   *
   * Prior to `mount()` execution, the visualize-it object
   * representation is very lightweight.
   *
   * @param {Konva.Stage} containingKonvaStage - the container of
   * this scene (a Konva.Stage).
   */
  mount(containingKonvaStage) { 

    // retain our stage for selected event processing
    this.containingKonvaStage = containingKonvaStage;

    // create our layer where our components will be mounted
    this.konvaSceneLayer = new Konva.Layer({
      id: this.id,
      x:  this.x,
      y:  this.y,
    });

    // mount our components into this layer
    this.comps.forEach( (comp) => comp.mount(this.konvaSceneLayer) );

    // wire our layer into the supplied containingKonvaStage
    // ... NOTE: This must be added AFTER the layer is populated :-(
    //           UNSURE WHY: seems like a Konva limitation :-(
    containingKonvaStage.add(this.konvaSceneLayer)
  }


  /**
   * Get self's current size (dynamically calculated).
   *
   * @returns {Size} self's current size ... {width, height}.
   */
  getSize() {
    // cached size takes precedence
    if (this.sizeCache) {
      return this.sizeCache;
    }

    // compute size
    // ... this sizeCache will be re-set whenever size has the potential of changing:
    //     - both in our initial mount (replacing "approximation" with "exact" size)
    //     - and during interactive edit changes (reflecting an updated size)
    // ... see: SmartModel.regenSizeTrickleUp()
    if (this.konvaSceneLayer) { // ... when mounted
      // dynamically calculate the size from our Layer/Canvas content
      const size = this.sizeCache = {width: 10, height: 10}; // ... minimum size
      this.konvaSceneLayer.getChildren().each( (shape,n) => {
        if (shape.getClassName() !== 'Transformer') { // ... really dislike how Konva does Transformer (making it part of our display list)
          const shapeBounds = shape.getClientRect();  // ... consider transformation
          size.width  = Math.max(size.width,  shapeBounds.x + shapeBounds.width); 
          size.height = Math.max(size.height, shapeBounds.y + shapeBounds.height); 
        }
      });
    }
    else { // ... when NOT mounted
      // provide initial size approximation (will be re-set when mounted)
      // ... AI: depending on initial flicker (of size changing when mounted)
      //         - OP1: persist the sizeCache
      //                ... although doesn't help component classes (the class may contain an .approxSize property)
      //         - OP1: hide content till fully mounted
      //         - OP2: some polymorphic API for initialSize()/approxSize()/guesstimateSize()
      //                ... UNSURE: in what object ... more research needed
      this.sizeCache = {width: 100, height: 100};
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
    // sync our newSize to our Konva.Layer
    // NOTE: This is NOT needed (even though originally I thought it was)
    //        - according to the Konva docs, the width/height are taken from the parent stage
    //          ... NOT the Layer/Canvas
    //        - makes sense, because size is NOT set in any of our Layer/Canvas context
    //          ... in our constructor() or our mount()
    //       We must however define this method (as a no-op) to fulfill the SmartView.bindSizeChanges() abstraction
    // no-op:
    // this.konvaSceneLayer.size(newSize);
    // this.konvaSceneLayer.draw();
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
    this.checkMounted('draggable');
    if (draggable===undefined) {               // getter:
      return this.konvaSceneLayer.draggable(); // return boolean setting
    }
    else {                                       // setter:
      this.konvaSceneLayer.draggable(draggable); // set internal object
      return this;                               // return self (for chaining)
    }
  }

}
Scene.unmangledName = 'Scene';
