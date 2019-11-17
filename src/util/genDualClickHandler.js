/**
 * genDualClickHandler is a generator function that supports BOTH the
 * registration of single/double click handlers.
 *
 * This is a work-around hack for the LACK of support from React for
 * dual single/double click handler!!
 * 
 * React currently support both `onClick` and `onDoubleClick` event
 * handlers.  However when BOTH are needed (i.e. registered) on the
 * same element, BOTH are fired (`onClick` multiple times, and
 * `onDoubleClick` for the double click).
 *
 * React has really dropped the ball on this, as many threads state
 * they are doing the right thing, because `onClick` is **NOT** an
 * `onSingleClick`, and that clients should do the kind of HACK found
 * here!

 * While it is true that `onClick` is NOT an `onSingleClick`, **THE
 * OBVIOUS ANSWER** is for them to **SUPPORT** an `onSingleClick`
 * handler, and simplify everyone's life, rather than expecting
 * clients to propagated hacks like this!!! _enough ranting_.
 *
 * @param {function} onSingleClick the callback hook to invoke when a
 * **single click** occurs.
 *
 * @param {function} onDoubleClick the callback hook to invoke when a
 * **double click** occurs.
 *
 * @param {int} [delay=250] the optional delay (in mills) to wait for
 * the second click ... DEFAULT: 250.
 *
 * @returns {function} the generated handler to register to React's
 * `onClick` event handler.
 */

export default function genDualClickHandler(onSingleClick, onDoubleClick, delay=250) {

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
