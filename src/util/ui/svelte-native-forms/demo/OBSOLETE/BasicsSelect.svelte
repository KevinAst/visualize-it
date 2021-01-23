<script>
 import {formChecker,  /*FormErr,*/
         fieldChecker, /*FieldErr*/} from '../../../svelte-native-forms';

 const submit  = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);
 const options = [1, 2, 3];

</script>

<form use:formChecker={{submit}}>

  <!-- ?? test select -->
  <label>
    Select:
    <select id="sel" name="sel"  use:fieldChecker>
      {#each options as option}
      <option value={option}>{option}</option>
      {/each}
    </select>
    <!--<FieldErr/>-->
  </label>

  <center>
    <!--<FormErr/>-->
  </center>
  <center>
    <input type="submit" value="Make It SO!">
  </center>
</form>
