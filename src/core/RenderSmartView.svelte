<script>
 import {onMount}  from 'svelte';
 import verify     from '../util/verify';
 import {isView}   from '../util/typeCheck';

 // component params
 export let view; // ... a SmartView

 // validate parameters
 const check = verify.prefix('<RenderSmartView> component property violation: ');
 // ... view
 check(view,          'view is required');
 check(isView(view),  'view must be a SmartView object');
 
 const {width, height} = view.getSize();
 
 let divContainer;
 
 onMount( () => {
   // activate the Konva visualization
   view.mount(divContainer);

   // on unmount() - deactivate the Konva visualization
   return () => view.unmount();
 });
 
</script>

<div bind:this={divContainer}
     {...$$restProps}
     style="backgroundColor: gray; width: {width}; height: {height}; border: 1px solid black;"/>
