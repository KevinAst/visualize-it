<script>
 export let name;       // from Material Design icon names (https://material.io/resources/icons/)
                        // ... depends on import of https://fonts.googleapis.com/icon?family=Material+Icons
 export let size = '';  // optional one-off size override ('1.4rem', '80%', 'small', etc.)
                        // ... NOTE: globally override via "material-icons" css class, ex:
                        //           KEY: In this context, it is TRUELY GLOBAL, so be careful
                        //             * :global(.material-icons) {
                        //	              font-size: 1.4rem;
                        //             }
 export let style = ''; // optional styling

 // provide optional one-off size override
 $: style += size ? ` font-size: ${size};` : '';
 // $: console.log(`xx Icon: style="${style}"`);
</script>

<!-- $$restProps pass through things like title="Tootip here" -->
<i class="material-icons" {style} on:click {...$$restProps}>{name}</i>
