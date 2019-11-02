//***
//*** Embrace the "node/model" terminology:
//***   - a "model" is our overall data model
//***   - a "node"  is a contained instance of typed data within our data model
//***


//***
//*** our meta data model (defining node data types)
//***

const metaModel = {  // our meta data model
  version: '1.2.3',
  nodeTypes: {  // a catalog hash of node types
    ValveXyz: { // a node type containing it's associated data (primed with default values)
      open:     true,
      flowDir:  'connector2',
      pressure: 120,
    },
    // etc ...
  },
};


//***
//*** our run-time data model (a master hash of node data instances)
//***

/**
   MUTABLE
   =======

   We must insure mutable data bindings work correctly.

   ACTUALLY this depends on the communication protocol.

   The simplest thing to do is pass all data over the wire.
   ... hmmm we could regret this :-(

   KEY: the way data is communicated/updated in our model is COMPLETELY app dependent.
   ... bottom line is this is outside our scope
 */


// MUTABLE: YES ... for our initial analyses, we assume this structure IS mutable (at the content level)
//              ... depending on our com protocol, we could re-consider MUTABLE structure
const model = { // our run-time data model                      // SUB-MUTABLE: NO (not at this level)
  version: '1.2.3',
  nodes: {   // a run-time catalog hash of node instances       // SUB-MUTABLE: NO (not at this level)
    valve1a: {          // a node instance (KEY: seeding Comps) // SUB-MUTABLE: NO (not at this level)
      type: 'ValveXyz', // of a specific node type
      content: {                                                // SUB-MUTABLE: YES
        open:    true,
        flowDir: 'connector2',
        pressure: 120,
      },
    },
    // etc ...
  }
};


/**
 *  ACCESSING MODEL:
 *  ===============
 *  Because our data model is a catalog of nodes, we can access the
 *  'valve1a' node instance as follows:
 */

// get util ...
function getNode(nodeName) {
  return model.nodes[nodeName];
}

// usage ...
const aNode = getNode('valve1a');


/**
 *  MAINTAINING MODEL (client or server/system):
 *  =================
 *
 *  NOTE: ULTIMATELY the client/server MUST match
 *        - one knows how to handle the other
 *        - I think this is REALLY the metaModel
 *
 *  OP 1: Master on client-side ... seems like applicable only in simulation (where client is driving the simulator)
 *        OP 1a: Seed with raw JSON structure
 *               - CON: would need a way to visualize/maintain this structure (unsure how, but requires additional work)
 *        OP 1b: Provide a "master" view that contains ALL comp/nodes
 *               - PRO: provides an existing way to maintain the model interactively
 *               - CON: could get a bit unwieldy on BIG models
 *
 *  OP 2: Master on server-side: ... seems like applicable IN real physical system (the system MUST master the model, the client merely monitors it)
 *        OP 2a: Server communicates master via com initial handshake
 *               - this is sim to 1a (above)
 */




//***
//*** our Component catalog ... driving comp selection in the builder
//***

// NOTE: in BOTH OP1/OP2 (below) we can merge multiple catalogs (in our plugin architecture)

const compCatalog = {
  plumbing: {    // intermediate levels simply represent a nested classification
    valves: {
      catalog: [ // OP1: keyword 'catalog' indicates component entries ... PRO: can have a node that is BOTH a component and a collector of other nodes <<< I think this is N/A too confusing
        SingleValve, // value is UI class name
        TwoWayValve,
      ],
    },
    pumps: [ // OP2: here is what it looks like using array heuristic (NOT catalog) ... CON: can't have node that is BOTH a component and a collector of other nodes <<< I think this OK (less confusing)
      PowerPump,
      SumpPump,
    ],
  },
  electrical: {
    // etc ...
  }
};


//***
//*** Component Bindings to specific node types
//*** ... provides specific data bindings to generic components
//***

const bindComp2Node = {

  // hash: {CompName}2{NodeType}
  SingleValve2ValveXyz: (comp, node) => {
    comp.curPressure  = () => node.content.pressure;
    comp.curDirection = () => node.content.direction==='connector2' ? 0 : 1;
    comp.isOpen       = () => node.content.open;
  },
  // etc...

};



//***
//*** a sample Component (some of this logic may be in base class)
//***

class SingleValve extends Comp {

  constructor(node,                 // node:          the data model instance this visual is bound to
              namedSettings=null) { // namedSettings: both general and proprietary/specific items (hash used to support persistence)
    this.node = node;
    
    // bind this component to the specific Node type (data binding)
    const bindingFn = bindComp2Node['SingleValve'+node.type];
    bindingFn(this, this.node);
  }

  // the following methods are part of a base class API to do various "edit" tasks
  // ... transform: resize, re-position
  // ... connect: etc. etc.
  // ... persistence
  transformResizeRepositionMethods() {
  }
  connectMethods() {
  }
  persistenceMethods() { // persist minimal data - className, and namedSettings (persistent params)
  }

  // the following are "proprietary/specific" methods used in visualizing/animating the graphical rendering
  // ... and are "overridden", dynamically bound to specific node types
  curPressure() {
    // default:
    return 999;
    // -OR- throw new Error('ERROR: SingleValve.curPressure() must be overridden!');
  }
  curDirection() {
    // default:
    return 1;
    // -OR- throw new Error('ERROR: SingleValve.curDirection() must be overridden!');
  }
  isOpen() {
    // default:
    return true;
    // -OR- throw new Error('ERROR: SingleValve.isOpen() must be overridden!');
  }

}



//***
//*** a View is the "logical" canvas, 
//*** ... a Display List holding Component instances making up the visual,
//*** ... WITHOUT the container window ViewPort
//***

/**
   View Notes:
   ==========
   - Each View "masters" a set of components
     * so the persistence can persist EACH component (as the master)
 */

class View {

  constructor(name, comps) {
    this.name  = name;
    this.comps = comps; // in essence, this is our display list!
  }

  persistenceMethods() { // simply persists this view with it's internal state (view-size etc), and EACH comp (data node names ONLY)
  }

}



//***
//*** Misc Concepts layering Views / ViewPorts / Perspectives
//***

/**
    Views
    =====
    - A collection of named Views, which in turn contain the components making up each view
    - Each view is the "logical" canvas
      - a Display List holding Component instances making up the visual,
      - WITHOUT the container window ViewPort
    - REPEAT: manifest() ... There is a concept where each View is pretty much lightweight data 
      until it is rendered on a physical canvas (via the ViewPort)

    ViewPorts
    =========
    - A collection of named ViewPorts
    - Each viewPort
      - is a "logical" window
      - containing/referencing a single view (persisting name only) 
      - defining the window characteristics (position, zoom factor, orientation etc.)
    - REPEAT: manifest() ... There is a concept where each View is pretty much lightweight data 
      until it is rendered on a physical canvas (via the ViewPort)

    Perspectives
    ============
    - A collection of named Perspectives
    - Each perspective
      - is a collection of 1:M ViewPorts (pre-defined)
      - and is a convenience - for rapid activation (pulling them up quickly - quick access)
 */
