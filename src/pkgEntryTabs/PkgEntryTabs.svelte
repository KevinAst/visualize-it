<script>
 import pkgEntryTabManager  from './pkgEntryTabManager';
 import StartUpPage         from './StartUpPage.svelte';
 import Tabs                from '../util/ui/tabManager/Tabs.svelte';
</script>

<Tabs tabManger={pkgEntryTabManager} splashComp={StartUpPage}/>
