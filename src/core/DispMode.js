import {Enumify} from 'enumify';

export default class DispMode extends Enumify {
  static view     = new DispMode();
  static edit     = new DispMode();
  static animate  = new DispMode();
  static _        = this.closeEnum();
}
