<script>
 import {Header, Title, Subtitle, Content} from '@smui/drawer';
 import List                               from '@smui/list';

 let leftNavCompEntries = [];

 // registerLeftNavEntry(comp): void ... dynamically add supplied component entry to LeftNav
 // ... comp: should render one-or-more <Item>s with optional additional content (such as <TreeView>)
 export function registerLeftNavEntry(comp) {
   leftNavCompEntries.push(comp);
   leftNavCompEntries = leftNavCompEntries; // make reactive
 }
</script>

<Header>
  <Title>Visualize It</Title>
  <Subtitle>packages ...</Subtitle>
</Header>

<Content>
  <List>
    {#each leftNavCompEntries as compEntry (compEntry)}
      <svelte:component this={compEntry}/>
    {/each}
  </List>
</Content>
