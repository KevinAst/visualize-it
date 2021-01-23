<script>
 import {formChecker,  FormErr,
         fieldChecker, FieldErr} from '../../../svelte-native-forms';

 const submit     = (event, fieldValues) => alert(`Successful submit (all fields are valid)!`);
 const isIdUnique = ({id}) => id==='dup' ? 'ID must be unique' : '';

</script>

<form use:formChecker={{submit}}>
  <label>
    Name:
    <input id="name" name="name" type="text" required minlength="3"
           use:fieldChecker>
    <FieldErr/>
  </label>

  <label>
    ID:
    <input id="id" name="id" type="text" required minlength="2" maxlength="10"
           use:fieldChecker={{validate: isIdUnique}}>
    <FieldErr/>
  </label>

  <center>
    <FormErr/>
  </center>
  <center>
    <input type="submit" value="Make It SO!">
  </center>
</form>
