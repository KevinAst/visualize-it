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

 // allow DnD drops based on polymorphic SmartObj.pastable()
 // ... GRRR: Must implement BOTH dragenter/dragover BECAUSE have to override the default implementation (which prevents a drop).
 //           This is optimized by caching, since nothing changes (for us) in drag over.
 let isAllowed = null;
 function allowDrops_enter(e) {
   // console.log(`xx allowDrops_enter on: `, {pallet: view.pallet, types: e.dataTransfer.types});
   isAllowed = view.pallet.pastable(e);
   allowDrops_over(e);
 };
 function allowDrops_over(e) {
   // console.log(`xx allowDrops_over on: `);
   if (isAllowed) {
     e.preventDefault(); // allow drop (nullify default disallow behavior)
     // console.log(`xx dropEffect BEFORE: ${e.dataTransfer.dropEffect}`);
     e.dataTransfer.dropEffect = 'link'; // change cursor to reflect droppable
     // console.log(`xx dropEffect AFTER: ${e.dataTransfer.dropEffect}`);
   }
 }

 // perform DnD drop based on polymorphic SmartObj.paste()
 function handleDrop(e) {
   // console.log(`xx handleDrop`);
   view.pallet.paste(e);
 };

</script>

<div bind:this={divContainer}
     {...$$restProps}
     on:dragenter={allowDrops_enter}
     on:dragover={allowDrops_over}
     on:drop|preventDefault={handleDrop}
     style="background-color: LightGray; width: {width}px; height: {height}px; border: 1px solid black;"/>
