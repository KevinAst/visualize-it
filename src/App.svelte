<script context="module">

 // various featureFlags used throughout the application
 export const featureFlags = {
   sandbox: true, // konva diagnostic sandbox
 };

</script>

<script>
  import {Notify}    from './util/ui/notify';
  import {AppLayout} from './appLayout';
</script>

<!-- enable our programatic notification utility ... supporting toast()/alert()/confirm() -->
<Notify/>

<!-- introduce our app's overall layout -->
<AppLayout/>
