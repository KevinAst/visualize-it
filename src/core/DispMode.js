import {Enumify} from 'enumify';

/**
 * An enumeration designating the various **visualize-it** Display Modes.
 */
export default class DispMode extends Enumify {
//ERROR: Support for the experimental syntax 'classProperties' isn't currently enabled (7:19):
//static view     = new DispMode();
//static edit     = new DispMode();
//static animate  = new DispMode();
//static _        = this.closeEnum();
}

// DO the old-fashion way, rather that attempting to re-configure svelte (see ERROR above)
DispMode.view     = new DispMode();
DispMode.edit     = new DispMode();
DispMode.animate  = new DispMode();
DispMode._        = DispMode.closeEnum();
