import {viewTestingDraggableScene, 
        viewTestingDraggableScene2,
        aCollageView}                from './draggableScene';

//******************************************************************************
//*** konvaSandbox: the data structure driving our Konva demonstrations,
//***               used to generate our LeftNav KonvaMenuPallet
//******************************************************************************

const konvaSandbox = {
  id:   'konvaSandbox',
  desc: 'Konva Sandbox',
  nodes: [
    { id: 'basics', desc: 'Basics',
      nodes: [
        // ?? would be NICE to get desc FROM the SmartView (a new property)
        { id: 'viewTestingDraggableScene',  desc: 'Scene View Demo',   smartView: viewTestingDraggableScene,  },
        { id: 'viewTestingDraggableScene2', desc: 'Scene View2 Demo',  smartView: viewTestingDraggableScene2, },
        { id: 'viewCollage',                desc: 'Collage View Demo', smartView: aCollageView, },
      ],
    }
  ],
};

export default konvaSandbox;
