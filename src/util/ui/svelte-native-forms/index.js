import fieldChecker from './fieldCheckerAction'; // ... NOTE: We drop the "Action" for public consumption!

//? import FormChecker  from './FormChecker';
//? import FieldChecker from './FieldChecker';
//? import FieldErr     from './FieldErr.svelte';
//? import FormErr      from './FormErr.svelte';

// promote our svelte-native-forms public API
export {
  fieldChecker,   // the fieldChecker action
  //? FormChecker,  // the top-level FormChecker class       ?? NO NO NO: PRIVATE
  //? FieldChecker, // the children  FieldChecker class      ?? NO NO NO: PRIVATE
  //? 
  //? FieldErr,     // the FieldErr component
  //? FormErr,      // the FormErr component
};
