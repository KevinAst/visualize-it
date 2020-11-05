import Konva                from 'konva';
import PseudoClass          from './PseudoClass';
import SmartPallet          from './SmartPallet';
import {ancestorOfLayer,
        containerSizeFudge} from './konvaUtil';
import verify               from '../util/verify';
import checkUnknownArgs     from '../util/checkUnknownArgs';
import {isNumber, isEqual}  from '../util/typeCheck';
import pkgManager           from './pkgManager';
import DispMode             from './DispMode';
import {toast}              from '../util/ui/notify';

/**
 * Scene is a SmartPallet derivation that models a single Scene to be
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
export default class Scene extends SmartPallet {

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
  getEncodingProps() {

    // define our "baseline"
    const encodingProps = [['x',0], ['y',0]];

    // for pseudoClass MASTERs, include non-temporal props
    // ... see JavaDoc for: SmartModel.getEncodingProps()
    if (this.pseudoClass.isType()) {
      encodingProps.push('comps');
    }

    return [...super.getEncodingProps(), ...encodingProps];
  }      

  /**
   * Promote the material icon "name" representing self's OO classification.
   */
  getIconName() {
    return 'photo'; // ALSO CONSIDER: crop_original
  }

  /**
   * Add the supplied comp to this scene.
   *
   * @param {SmartComp} comp - the comp to add.
   */
  addComp(comp) {
    this.comps.push(comp);
    comp.setParent(this);
  }

  /**
   * Remove self's comp as identified through the supplied compId.
   *
   * @param {string} compId - the id of the comp to remove.
   */
  removeComp(compId) {
    const indx = this.comps.findIndex( (comp) => comp.id === compId);
    if (indx > -1) {
      this.comps.splice(indx, 1);
    }
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

    //***
    //*** enable dragging ... to all top-level konvaComps
    //***

    // draggable: enable (propagate into each top-level shape/group)
    this.konvaSceneLayer.getChildren().each( (konvaComp, n) => konvaComp.draggable(true) );

    // monitor events at the Konva Scene Layer level (using Event Delegation and Propagation)
    // ... dragend: monitor x/y changes - syncing KonvaLayer INTO our Scene SmartObject
    this.konvaSceneLayer.on('dragend', (e) => {

      // locate our component matching the target Konva.Group
      // ... we correlate the id's between Konva/SmartObject
      const konvaObj = e.target;
      const id       = konvaObj.id();
      const comp     = this.comps.find( (comp) => comp.id === id );
      // console.log(`xx Konva Scene Layer dragend: index: ${konvaObj.index}, id: ${konvaObj.id()}, name: ${konvaObj.name()} x: ${konvaObj.x()}, y: ${konvaObj.y()} ... e:\n`, {e, comp});

      // helpers to service undo/redo
      // NOTE: we use this.konvaSceneLayer (a lower-level obj) NOT this.containingKonvaStage
      // IMPORTANT: all updates must be written in such a way that DOES NOT reference stale objects
      //            - when using undo/redo (over the course of time) objects may be "swapped out" via the synchronization process
      //            - SOLUTION: resolve all objects from the "id" string AT RUN-TIME!!
      const oldLoc = {
        x: comp.x,
        y: comp.y
      };
      const newLoc = {
        x: konvaObj.x(),
        y: konvaObj.y()
      };
      const applySmartObjectChange = (loc) => {
        const comp = this.comps.find( (comp) => comp.id === id );
        comp.x = loc.x;
        comp.y = loc.y;
        return comp;
      }

      // apply our change
      this.changeManager.applyChange({
        changeFn() {
          return applySmartObjectChange(newLoc);
        },
        undoFn() {
          return applySmartObjectChange(oldLoc);
        }
      });

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

      // our real target is the top-level group (the konva representation of our component)
      const konvaComp = ancestorOfLayer(e.target);

      // create/manage new transformer
      var transformer = new Konva.Transformer();
      this.konvaSceneLayer.add(transformer);
      transformer.nodes([konvaComp]);
      this.konvaSceneLayer.draw();

      // sync Konva changes to Object Model
      konvaComp.on('transformend', (e) => { // ... NOTE: updates x/y/rotation/scaleX/scaleY ... NOT width/height at all

        // AI: there is a Konva BUG: where the 'transformend' is fired multiple times per event
        //     - not only is this bad from a performance perspective
        //     - BUT IT HAS BAD side-effects related to undo
        //     - research this:
        //       KJB: appears to be related to "deselecting" the transformer when undo occurs
        //            ... this is the normal scenario
        //            ... KJB: I really don't like how Konva does selection in it's Transformer
        //     - KJB: WORK-AROUND: no-op when Konva/SmartObject have the same transformation

        // locate our component matching the target Konva.Group
        // ... we correlate the id's between Konva/SmartObject
        const konvaObj = e.target;
        const id       = konvaObj.id();
        const comp     = this.comps.find( (comp) => comp.id === id );
        // console.log(`xx Konva Scene Layer transformend: x: ${konvaObj.x()}, y: ${konvaObj.y()}, rotation: ${konvaObj.rotation()}, scaleX: ${konvaObj.scaleX()}, scaleY: ${konvaObj.scaleY()},  ... matching comp: `, comp);

        // helpers to service undo/redo
        // NOTE: we use this.konvaSceneLayer (a lower-level obj) NOT this.containingKonvaStage
        // IMPORTANT: all updates must be written in such a way that DOES NOT reference stale objects
        //            - when using undo/redo (over the course of time) objects may be "swapped out" via the synchronization process
        //            - SOLUTION: resolve all objects from the "id" string AT RUN-TIME!!
        const oldTrans = {
          x:        comp.x,
          y:        comp.y,
          rotation: comp.rotation,
          scaleX:   comp.scaleX,
          scaleY:   comp.scaleY,
        };
        const newTrans = {
          x:        konvaObj.x(),
          y:        konvaObj.y(),
          rotation: konvaObj.rotation(),
          scaleX:   konvaObj.scaleX(),
          scaleY:   konvaObj.scaleY(),
        };

        // no-op when Konva/SmartObject have the same transformation
        // ... see: WORK-AROUND Konva BUG (above)
        if (isEqual(oldTrans, newTrans)) {
          // console.log('xx Scene: transformEnd NO-OP (identical transformation to self) *********************');
          return;
        }

        const applySmartObjectChange = (trans) => {
          const comp    = this.comps.find( (comp) => comp.id === id );
          comp.x        = trans.x;
          comp.y        = trans.y;
          comp.rotation = trans.rotation;
          comp.scaleX   = trans.scaleX;
          comp.scaleY   = trans.scaleY;
          return comp;
        }

        // apply our change
        this.changeManager.applyChange({
          changeFn() {
            return applySmartObjectChange(newTrans);
          },
          undoFn() {
            return applySmartObjectChange(oldTrans);
          }
        });

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
   * Provide indicator as to whether self can be copied to other sources (i.e. a DnD source)
   *
   * API: DnD
   *
   * @returns {CopySrc} a CopySrc: {type, key} ... null when NOT copyable
   */
  copyable() {
    return {
      type: 'visualize-it/Scene'.toLowerCase(), // self represents a Scene
      key:  this.getPkgEntryId(),               // ex: 'com.astx.ACME/scene1'
    };
  }

  /**
   * Is the content of the supplied DnD event pastable in self (i.e. a DnD target)
   *
   * API: DnD
   *
   * @param {Event} e - the DnD event
   *
   * @returns {boolean} `true`: content of DnD event IS pastable, `false` otherwise
   */
  pastable(e) {
    // Scene allows SmartComp objects to be pasted
    return e.dataTransfer.types.includes('visualize-it/smartcomp');
  }

  /**
   * Perform the DnD paste operation of the supplied DnD event.
   *
   * API: DnD
   *
   * @param {Event} e - the DnD event
   */
  paste(e) {
    // verify we are in edit mode
    if (this.getPkgEntry().getDispMode() !== DispMode.edit) {
      toast({msg: 'Drops require package entry to be in edit mode.'});
      return;
    }

    // reconstitute our copySrc from the DnD event
    const type    = e.dataTransfer.types[0]; // ... our usage only uses one type
    const copySrc = {
      type,
      key:  e.dataTransfer.getData(type),
    };
    // console.log(`xx pasting: `, {copySrc, onto: this});

    // NOTE: we know the supplied copySrc references a SmartComp class (see pastable() method)

    // helpers to service undo/redo
    // IMPORTANT: all updates must be written in such a way that DOES NOT reference stale objects
    //            - when using undo/redo (over the course of time) objects may be "swapped out" via the synchronization process
    //            - SOLUTION: resolve all objects from the "id" string AT RUN-TIME!!
    const [pkgId, className] = copySrc.key.split('/');
    const compClassRef       = pkgManager.getClassRef(pkgId, className);
    const compId             = `${className}-copy-${Date.now()}`; // ... unique id (for now use current time)
    
    // retain selfScene `this` alias
    // ... NOTE: `this` IS retained in our closure, 
    //           HOWEVER unless changeFn() is an arrow function, it has a different `this` context
    const selfScene = this;

    // apply our change
    this.changeManager.applyChange({
      changeFn() {
        // translate the DnD event's absolute page coordinates to canvas coordinates for our scene
        const canvasCoord = selfScene.dndCanvasCoord(e);

        // add a new comp (from the DnD drop) to our scene
        const newComp = compClassRef.createSmartObject({
          id: compId,
          x:  canvasCoord.x,
          y:  canvasCoord.y,
        });
        selfScene.addComp(newComp);

        return newComp; // promote the new comp as our change target
      },

      undoFn() {
        // remove the scene from our collage
        selfScene.removeComp(compId);

        return selfScene; // promote our scene as our change target
      }
    });
  }
  
  /**
   * Verify self has been mounted.
   * @param {string} [method] - the method name on which behalf we are checking.
   */
  checkMounted(method) {
    verify(this.isMounted(), `${this.diagClassName()}.${method}() can only be invoked after mounting.`);
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
   * Return an indicator as to whether self is mounted (i.e. bound to the Konva graphics).
   *
   * @returns {boolean} `true`: self is mounted, `false` otherwise
   */
  isMounted() {
    return this.konvaSceneLayer ? true : false;
  }

  /**
   * Unmount the visuals of this scene, unbinding the graphics to the
   * underlying canvas.
   *
   * @param {boolean} [konvaPreDestroyed=false] - an internal
   * parameter that indicates if konva nodes have already been
   * destroyed (when a parent Konva.Node has already issued the
   * konvaNode.destroy()).
   */
  unmount(konvaPreDestroyed=false) {
    // destroy our Konva representation
    // ... the Konva.destroy() is deep (clearing all containment)
    // ... therefore, we do it conditionally, when not already accomplished by our parent
    if (!konvaPreDestroyed) {
      this.konvaSceneLayer.destroy();
    }

    // clear our konva state (established in our mount())
    this.containingKonvaStage = null;
    this.konvaSceneLayer      = null;
    
    // propagate request into our children
    this.comps.forEach( (comp) => comp.unmount(true/*konvaPreDestroyed*/) );
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
    if (this.konvaSceneLayer) { // ... when mounted
      // dynamically calculate the size from our Layer/Canvas content
      const size = this.sizeCache = {width: 10, height: 10}; // ... minimum size
      this.konvaSceneLayer.getChildren().each( (shape,n) => {
        if (shape.getClassName() !== 'Transformer') { // ... really dislike how Konva does Transformer (making it part of our display list)
          const shapeBounds = shape.getClientRect();  // ... consider transformation
          size.width  = Math.max(size.width,  shapeBounds.x + shapeBounds.width   + containerSizeFudge);
          size.height = Math.max(size.height, shapeBounds.y + shapeBounds.height  + containerSizeFudge); 
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

}
Scene.unmangledName = 'Scene';
