import Notify,
       {pushMsgOnSnackbar} from './comp/Notify.svelte';
import verify              from '~/util/verify.js';
import checkUnknownArgs    from '~/util/checkUnknownArgs.js';
import {isString,
        isNumber,
        isPlainObject,
        isFunction}        from '~/util/typeCheck.js';

/**
 * The one-and-only `<Notify/>` component to be instantiated at the
 * app root.
 */
export {
  Notify,
};

const DEFAULT = 'APPLY-DEFAULT';

/**
 * Display a toast message to the user.
 *
 * Example:
 * ```js
 *   toast({
 *     msg:      'You have un-saved changes.\nif you leave, your changes will NOT be saved!',
 *     actions: [ // optional app-specific actions/buttons
 *       { txt: 'Discard Changes', action: () => ...callback-logic-here... },
 *       { txt: 'Go Back' }
 *     ],
 *     stacked:     true,  // vertically space msg/buttons (DEFAULT: false)
 *     dismissible: false, // user can dismiss early       (DEFAULT: true)
 *   });
 * ```
 * 
 * **Please Note** this function uses named parameters.
 *
 * @param {string} msg - the toast message to display (cr/lf are
 * supported).
 *
 * @param {Action[]} [actions=[]] zero or more client-supplied actions
 * (button/action combinations).  When clicked, each action will
 * implicitly close the toast, in addition to invoking the optional
 * client-supplied action callback.  Each action has the following
 * form:
 * ```js
 * {
 *   txt:    'Reset',                         // the button label
 *   action: () => ...callback-logic-here..., // optional callback
 * }
 * ```
 *
 * @param {boolean} [stacked] - an indicator as to whether the
 * action buttons are vertically separated from the msg
 * ... DEFAULT: stacked when actions supplied.
 *
 * @param {boolean} [dismissible] - an indicator as to whether
 * the user can dismiss the toast dialog early (NOTE: All toasts
 * are auto-dismissed over time).
 * ... DEFAULT: dismissible when actions are NOT supplied.
 *
 * @throws {Error} for invalid params.
 */
export function toast({msg, actions=[], stacked=DEFAULT, dismissible=DEFAULT, ...unknownArgs}={}) {
  // verify params
  const check = verify.prefix('toast() parameter violation: ');
  // ... msg
  check(msg,           'msg is required');
  check(isString(msg), `msg must be a string, NOT: ${msg}`);
  // ... actions
  check(Array.isArray(actions), 'actions must be an Action[] array');
  actions.forEach( (action, indx) => {
    check(isPlainObject(action),     `action[${indx}] must be an object literal ... NOT: ${action}`);
    check(action.txt,                `action[${indx}].txt is required`);
    check(isString(action.txt),      `action[${indx}].txt must be a string ... NOT: ${action.txt}`);
    if (action.action) {
      check(isFunction(action.action), `action[${indx}].action (when supplied) must be a function ... NOT: ${action.action}`);
    }
    else {
      action.action = (p) => p;  // no-op default
    }
  });
  const actionsSupplied = actions.length > 0;
  // ... stacked
  if (stacked===DEFAULT) {                    // apply run-time DEFAULT:
    stacked = actionsSupplied ? true : false; // ... stacked with actions
  }
  check(stacked===true || stacked===false, 'stacked must be a boolean');
  // ... dismissible
  if (dismissible===DEFAULT) {                    // apply run-time DEFAULT:
    dismissible = actionsSupplied ? false : true; // ... NOT dismissible with actions
  }
  check(dismissible===true || dismissible===false, 'dismissible must be a boolean');
  // ... duration: NOT: can only set snackbar$timeoutMs at <Kitchen> instantiation time (see <Notify>)
  // check(isNumber(duration), `duration must be a number, NOT: ${duration}`);
  // check(duration >= 4 && duration <= 10, `duration (${duration}) must be a number between 4 and 10 (inclusive).`);
  // ... unknown arguments
  checkUnknownArgs(check, unknownArgs, arguments);

  // convert toastParams to snackbarParams
  const snackbarParams = {
    props: {
      variant:          stacked ? 'stacked' : '', // stacked: vertically separate msg/buttons
    },
    label:              msg,
    actions:            actions.map( (action) => ({text: action.txt, onClick: action.action}) ),
    dismissButton:      dismissible, // allow user to dismiss early

  //onDismiss:          () => console.log('xx Dismissed'), // UNNEEDED: fired when user dismisses early
  //onClose:           (e) => console.log('xx Closed'),    // UNNEEDED: fired when closed (either auto or user)
  };

  // process the request
  pushMsgOnSnackbar(snackbarParams);
}
