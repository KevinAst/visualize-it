import fieldChecker from './fieldCheckerAction'; // NOTE: We drop the "Action" for public consumption!
import formChecker  from './formCheckerAction';  //       ... ditto
import FieldErr     from './FieldErr.svelte';
import FormErr      from './FormErr.svelte';

// promote our svelte-native-forms public API
export {
  fieldChecker,  // the fieldChecker action
  formChecker,   // the formChecker action

  FieldErr,     // the FieldErr component
  FormErr,      // the FormErr component
};
