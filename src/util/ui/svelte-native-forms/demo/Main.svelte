<script>
 // ?? pretend we are hooked into our selector
 import DynamicsTableUnder from './OBSOLETE/DynamicsTableUnder.svelte';
 let Demo = DynamicsTableUnder;
</script>

<!-- promote active <Demo/> -->
<main>
  <svelte:component this={Demo}/>
</main>

<style>
 main {
   padding: 1rem;
 }
</style>
