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

 // ?? DnD: can access content via: view.pallet (a SmartPallet: Scene/Collage/CompRef)

 // allow drops based on polymorphic SmartObj.pastable()
 //  - ?? GRRR: must implement BOTH dragenter/dragover BECAUSE have to override the default implementation (which prevents a drop)
 // ?? optimize this for enter/over (over required but use cached results of enter) 
 function allowDrops(e) {
   // console.log(`xx dragEnter on: `, {pallet: view.pallet, types: e.dataTransfer.types});

   const isAllowed = view.pallet.pastable(e);

   if (isAllowed) {
     e.preventDefault(); // allow drop (nullify default disallow behavior)
     // console.log(`?? dropEffect BEFORE: ${e.dataTransfer.dropEffect}`);
     e.dataTransfer.dropEffect = 'link'; // change cursor to reflect droppable
     // console.log(`?? dropEffect AFTER: ${e.dataTransfer.dropEffect}`);
   }
 };

 // perform drops based on polymorphic SmartObj.paste()
 function handleDrop(e) {
   view.pallet.paste(e);
 };

 
</script>

<!-- ?? DnD:
     on:dragover|preventDefault={(e)=>undefined}

     on:dragenter={allowDrops}
     on:dragover={allowDrops}
 -->
<div bind:this={divContainer}
     {...$$restProps}
     on:dragenter={allowDrops}
     on:dragover={allowDrops}
     on:drop|preventDefault={handleDrop}
     style="background-color: LightGray; width: {width}px; height: {height}px; border: 1px solid black;"/>
