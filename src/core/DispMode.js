import {Enumify} from 'enumify';

/**
 * An enumeration designating the various **visualize-it** Display Modes.
 */
export default class DispMode extends Enumify {
  static view     = new DispMode();
  static edit     = new DispMode();
  static animate  = new DispMode();
  static _        = this.closeEnum();
}
