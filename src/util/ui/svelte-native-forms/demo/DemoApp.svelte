<script>
 import Basics               from './Basics.svelte';
 import Dynamics             from './Dynamics.svelte';
 import BasicsTextArea       from './BasicsTextArea.svelte';
 import BasicsSelect         from './BasicsSelect.svelte';
 import BasicsGroupedInputs  from './BasicsGroupedInputs.svelte';

 const demos = [
   [Basics,              'Basics'],
   [Dynamics,            'Dynamics'],
   [BasicsTextArea,      'BasicsTextArea'],
   [BasicsSelect,        'BasicsSelect'],
   [BasicsGroupedInputs, 'BasicsGroupedInputs'],


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
