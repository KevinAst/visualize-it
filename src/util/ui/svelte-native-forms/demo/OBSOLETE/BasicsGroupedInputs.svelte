<script>
 import {formChecker,  /*FormErr,*/
         fieldChecker, /*FieldErr*/} from '../../../svelte-native-forms';

 const submit  = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);

</script>

<form use:formChecker={{submit}}>

  <!-- ?? test radio -->
  <label>
    Radio:
    <input type="radio" name="Wow" value="1" use:fieldChecker> 1
    <input type="radio" name="Wow" value="2" use:fieldChecker> 2
    <input type="radio" name="Wow" value="3" use:fieldChecker> 3
  </label>

  <center>
    <!--<FormErr/>-->
  </center>
  <center>
    <input type="submit" value="Make It SO!">
  </center>
</form>
