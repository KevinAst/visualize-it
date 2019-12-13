import sceneView1   from './sceneView1';
import sceneView2   from './sceneView2';
import collageView1 from './collageView1';

//******************************************************************************
//*** konvaSandboxCatalog: the resource catalog driving our Konva demonstrations.
//*** 
//*** This is a data structure with depth that demonstrates how our
//*** LeftNav KonvaMenuPallet can be "data driven".
//*** 
//*** This is a predecessor to our System Resource and Component
//*** catalogs that will be a persistent resource, retrieved from an
//*** external source.
//******************************************************************************

const konvaSandboxCatalog = {
  id:   'konvaSandboxCatalog',
  desc: 'Konva Sandbox',
  nodes: [
    { id: 'basics', desc: 'Basics',
      nodes: [
        // ?? would be NICE to get desc FROM the SmartView (a new property)
        //    - ?? while we are at it, SmartView HAS an id, could we (should we) use THAT id?
        //    - ?? keep in mind, the OTHER nodes would have to specify their id/desc)
        { id: 'sceneView1',   desc: 'Scene View 1',   view: sceneView1,   },
        { id: 'sceneView2',   desc: 'Scene View 2',   view: sceneView2,   },
        { id: 'collageView1', desc: 'Collage View 1', view: collageView1, },
      ],
    }
  ],
};

export default konvaSandboxCatalog;
