import React               from 'react';
import {useRef, useEffect} from 'react';

// ReactSmartView: a re-usable React Component that mounts (i.e. renders) a SmartView.
//                 NOTE: This is part of util because it is a react utility 
//                       used by the interactive tool ... NOT a core offering!
export default function ReactSmartView({view, ...otherProps}) {

  const stageElm = useRef(null);

  // mount the view canvas graphics, once self is fully manifest in the real HTML DOM
  useEffect( () => {
    view.mount(stageElm.current);    
  }, [view]); // ... the dependency list prevents redundant mounts()

  // ?? crude test
  // ? style={{backgroundColor: 'gray', borderWidth: 5, borderStyle: 'solid', borderColor: 'purple'}}
  // ?? AI: the style characteristics (below) will be eventually gleaned from future SmartView API
  //        ex: view.backgroundColor, view.width, view.height 
  //        THE BORDER is provided by US (not sure) to expose the view border and/or ability to edit width/height (unsure about this last one)
  const {width, height} = view.size();
  return <div ref={stageElm} {...otherProps} style={{backgroundColor: 'gray', width, height, border: '1px solid black'}}/>;
}
