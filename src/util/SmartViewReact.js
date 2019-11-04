import React               from 'react';
import {useRef, useEffect} from 'react';

// SmartViewReact: a re-usable React Component that manifests (i.e. renders) a SmartView.
//                 NOTE: This is part of util because it is a react utility 
//                       used by the interactive tool ... NOT a core offering!
export default function SmartViewReact({view, ...otherProps}) {

  const stageElm = useRef(null);

  useEffect( () => { // runs after the render is committed to the screen - BY DEFAULT after EVERY render ? may need to conditionalize this HOWEVER don't see it invoked more than once
    view.manifest(stageElm.current);    
  });

  // ?? crude test
  return <div ref={stageElm} {...otherProps} style={{backgroundColor: 'gray', borderWidth: 5, borderStyle: 'solid', borderColor: 'purple'}}/>;
}
