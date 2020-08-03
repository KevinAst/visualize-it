<script>
 import Paper, {Title, Content} from '@smui/paper';
</script>


<div class="splash-container">
  <Paper class="splash">
    <Content>
      <img src="visualize-it-logo.png" width="30%" alt="Logo"/>
      <Title>Your View into External Systems!</Title>
      <img src="visualize-it-logo-eyes.jpg" width="80%" alt="Logo Eyes"/>
    </Content>
  </Paper>
</div>


<style>
 .splash-container {
   padding: 11px;
 }

 * :global(.splash) {
   margin:     0 auto;
   max-width:  600px;
   text-align: center /* center content */
 }
</style>
