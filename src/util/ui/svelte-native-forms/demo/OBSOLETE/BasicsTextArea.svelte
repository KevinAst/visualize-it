<script>
 import {formChecker,  /*FormErr,*/
         fieldChecker, /*FieldErr*/} from '../../../svelte-native-forms';

 const submit  = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);

</script>

<form use:formChecker={{submit}}>

  <!-- ?? test textarea -->
  <label>
    Desc:
    <textarea id="desc" name="desc" rows="4" cols="50" use:fieldChecker>This is a test</textarea>
    <!--<FieldErr/>-->
  </label>

  <center>
    <!--<FormErr/>-->
  </center>
  <center>
    <input type="submit" value="Make It SO!">
  </center>
</form>
