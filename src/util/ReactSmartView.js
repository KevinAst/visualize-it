import React               from 'react';
import {useRef, useEffect} from 'react';
import {createLogger}      from 'util/logger';

// our internal diagnostic logger (normally disabled)
const log = createLogger('***DIAG*** <ReactSmartView> ... ').disable();


// ReactSmartView: a re-usable React Component that mounts (i.e. renders) a SmartView.
//                 NOTE: This is part of util because it is a react utility 
//                       used by the interactive tool ... NOT a core offering!
function ReactSmartView({view, ...otherProps}) {

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
  log('here is my view: ', view);
  const {width, height} = view.getSize();
  return <div ref={stageElm} {...otherProps} style={{backgroundColor: 'gray', width, height, border: '1px solid black'}}/>;
}

// PERF: memo is critical (without it re-render is frequent, even activating tabs)
//       - bypasses render if props are the same (can override shallow comparison with a second fn param to memo()
//       - also still allows re-render on hooks direction
export default React.memo(ReactSmartView);
