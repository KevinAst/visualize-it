import {viewTestingDraggableScene, 
        viewTestingDraggableScene2} from './draggableScene';

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
        { id: 'viewTestingDraggableScene',  desc: 'Draggable Scene',   smartView: viewTestingDraggableScene,  },
        { id: 'viewTestingDraggableScene2', desc: 'Draggable Scene 2', smartView: viewTestingDraggableScene2, },
      ],
    }
  ],
};

export default konvaSandbox;
