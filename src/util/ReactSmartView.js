import React               from 'react';
import {useRef, useEffect} from 'react';

// ReactSmartView: a re-usable React Component that mounts (i.e. renders) a SmartView.
//                 NOTE: This is part of util because it is a react utility 
//                       used by the interactive tool ... NOT a core offering!
export default function ReactSmartView({view, ...otherProps}) {

  const stageElm = useRef(null);

  useEffect( () => { // runs after the render is committed to the screen - BY DEFAULT after EVERY render ? may need to conditionalize this HOWEVER don't see it invoked more than once
    view.mount(stageElm.current);    
  }, [view]); // ??$$ see if [] fixes? ... the dependency list seems to fix redundant mounts()

  // ?? crude test
  // ? style={{backgroundColor: 'gray', borderWidth: 5, borderStyle: 'solid', borderColor: 'purple'}}
  // ?? AI: the style characteristics (below) will be eventually gleaned from future SmartView API
  //        ex: view.backgroundColor, view.width, view.height 
  //        THE BORDER is provided by US (not sure) to expose the view border and/or ability to edit width/height (unsure about this last one)
// ??$$ we MUST get width from our view (via it's scene)
  return <div ref={stageElm} {...otherProps} style={{backgroundColor: 'gray', width: 300, height: 250, border: '1px solid black'}}/>;
}
