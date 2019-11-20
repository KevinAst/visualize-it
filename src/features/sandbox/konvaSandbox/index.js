import draggableView from './draggableView';

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
        { id: 'draggableView', desc: 'Draggable View', smartView: draggableView, },
        { id: 'temp2',         desc: 'Temp Test 2',    smartView: draggableView, },
      ],
    }
  ],
};

export default konvaSandbox;
