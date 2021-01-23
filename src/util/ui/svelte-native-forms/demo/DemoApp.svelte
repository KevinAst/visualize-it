<script>
 import Basics               from './Basics.svelte';

 import DynamicsBlockRight   from './DynamicsBlockRight.svelte';
 import DynamicsUnderRight   from './DynamicsUnderRight.svelte';
 import DynamicsFlex         from './DynamicsFlex.svelte';
 import DynamicsTableUnder   from './DynamicsTableUnder.svelte';

 import BasicsTextArea       from './BasicsTextArea.svelte';
 import BasicsSelect         from './BasicsSelect.svelte';
 import BasicsGroupedInputs  from './BasicsGroupedInputs.svelte';

 import Sandbox              from './Sandbox.svelte';

 const demos = [
   [Basics,              'Basics'],

   [DynamicsBlockRight,  'DynamicsBlockRight'],
   [DynamicsUnderRight,  'DynamicsUnderRight'],
   [DynamicsFlex,        'DynamicsFlex'],
   [DynamicsTableUnder,  'DynamicsTableUnder'],

   [BasicsTextArea,      'BasicsTextArea'],
   [BasicsSelect,        'BasicsSelect'],
   [BasicsGroupedInputs, 'BasicsGroupedInputs'],

   [Sandbox,             'Sandbox'],
 ];

 let Demo = demos[0][0];

 // TEMPORARY techniqe to style the body (only needed because this demo is NOT the real visualize-it main)
 // document.body.style.margin = '10px'; ?? causes scroll bars ?? do in in global.css

</script>

<b>Demo</b>:

<!-- select the active <Demo/> -->
<select bind:value={Demo}>
  {#each demos as [comp, desc]}
    <option value={comp}>{desc}</option>
  {/each}
</select>

<hr/>

<!-- promote active <Demo/> -->
<svelte:component this={Demo}/>
