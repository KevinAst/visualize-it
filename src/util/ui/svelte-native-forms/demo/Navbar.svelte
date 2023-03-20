<script>
 import Logo from './Logo.svelte'
 import Hamburger from './Hamburger.svelte'
 import Menu from './Menu.svelte'
 
 export let sidebar = false
</script>

<header>
	<nav>
		<Hamburger bind:open={sidebar}/>
		<Logo/>	
	</nav>
	
	<Menu/>
</header>

<style>
 /* KJB: replace tailwind classes:  <header class="flex justify-between bg-gray-200 p-2 items-center text-gray-600 border-b-2"> */
 header {
   /* flex */
   display: flex;

   /* justify-between */
   justify-content: space-between;

   /* bg-gray-200 */
   --tw-bg-opacity: 1;
   background-color: rgba(229, 231, 235, var(--tw-bg-opacity));

   /* p-2 */
   padding: 0.5rem;

   /* items-center */
	 align-items: center;

   /* ext-gray-600 */
   --tw-text-opacity: 1;
   color: rgba(75, 85, 99, var(--tw-text-opacity));

   /* border-b-2 */
   border-bottom-width: 2px;
 }

 /* KJB: replace tailwind classes: <nav class="flex"> */
 nav {
   display: flex;
 }
</style>
