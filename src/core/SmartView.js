import Konva  from 'konva';

// SmartView: a concrete class that manages named visualize-it views of our system
export default class SmartView {

  constructor(name, comps) {
    this.name  = name;
    this.comps = comps; // in essence, this is our display list!
    this.x = 0; // ?? crude for now
    this.y = 0; 
  }

  //? persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  //? }

  // manifest self's view self supplied html elm
  manifest(elm) {

    console.log('invoking: SmartView.manifest()');

    // KJB: currently assume Stage (container) ... per view
    const stage = new Konva.Stage({
      container: elm,
      x:         this.x, // ?? crude for now
      y:         this.y,
      width:     300, // ? parameterize
      height:    250,
    });

    // KJB: currently assume ONE Layer (canvas) ... per view
    //      TODO: I think multiple Konva.Layers will allow us to manage multiple views/scenes (canvas) in ONE container
    const layer = new Konva.Layer({
      draggable: true, // ?? crude test - yes you can drag the entire layer HOWEVER must drag one of it's object UNSURE if this restricts individual objects from dragging?
    });

    // manifest self's components
    this.comps.forEach( (comp) => comp.manifest(layer) );
    
    // wire up layer/ stage ... must be added after layer is populated ... ? WHY?
    stage.add(layer);
  }

}
