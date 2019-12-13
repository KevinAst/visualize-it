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
  name: 'Konva Sandbox',
  nodes: [
    { id: 'scenes', name: 'Scenes',
      nodes: [
        sceneView1,
        sceneView2,
      ],
    },
    { id: 'collages', name: 'Collages',
      nodes: [
        collageView1,
      ],
    },
  ],
};

export default konvaSandboxCatalog;
