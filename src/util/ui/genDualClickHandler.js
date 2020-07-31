import verify                 from '../verify';
import {isFunction, isNumber} from '../typeCheck';

/**
 * Generate a handler function that accommodates both single-click and
 * double-click on a specified delay.
 *
 * @param {function} onSingleClick - the single click handler, fired
 * when delay has been surpassed.
 *
 * @param {function} onDoubleClick - the double click handler, fired
 * when second click occurs within the delay time period.
 *
 * @param {int} [delay=250] - the delay time (ms) defining the double
 * click speed.
 */
export default function genDualClickHandler(onSingleClick, onDoubleClick, delay=250) {

  // verify params
  const check = verify.prefix('genDualClickHandler() parameter violation: ');
  // ... onSingleClick
  check(onSingleClick,             'onSingleClick is required');
  check(isFunction(onSingleClick), `onSingleClick must be a function, NOT: ${onSingleClick}`);
  // ... onDoubleClick
  check(onDoubleClick,             'onDoubleClick is required');
  check(isFunction(onDoubleClick), `onDoubleClick must be a function, NOT: ${onDoubleClick}`);
  // ... delay
  check(isNumber(delay),           `delay must be a number, NOT: ${delay}`);

  let timeoutID = null;

  return function (...rest) { // onClick will pass event, but use ...rest to support any signature
    if (!timeoutID) { // FIRST CLICK: create timeout (waiting for potential second click)
      timeoutID = setTimeout(function () {
        onSingleClick(...rest); // invoke onSingleClick() - timeout has passed (with no additional clicks)
        timeoutID = null;       // reset our timeout indicator
      }, delay);
    }
    else { // SECOND CLICK (within timeout period)
      clearTimeout(timeoutID); // clear our timeout
      timeoutID = null;        // reset our timeout indicator
      onDoubleClick(...rest);  // invoke onDoubleClick(event)
    }
  };
}
