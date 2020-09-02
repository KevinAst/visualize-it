import applyChange  from './applyChange';
import verify       from '../../util/verify';

/**
 * UndoRedo is an internal class that manages undo/redo operations for
 * a given EPkg (PkgEntry or SmartPkg)
 *
 * @private
 */
export default class UndoRedoMgr {

  /**
   * Create an UndoRedo instance.
   *
   * @param {ChangeManager} changeManager - the changeManager on whose
   * behalf we are operating.
   */
  constructor(changeManager) {
    // NO validate parameters (internal usage only)

    // maintain the linkage between self and changeManager
    this.changeManager        = changeManager;
    changeManager.undoRedoMgr = this;

    // carve out our state
    this.stack = []; // [ [undoFn, redoFn], ... ]
    this.cur = -1;   // points to the actual current stack entry (-1 for NO entries)
  }

  /**
   * Register the supplied undo/redo operation to self.
   * 
   * @param {function} undoFn - the function that "undoes" the low-level
   * change.
   * 
   * @param {function} redoFn - the function that applies the
   * low-level change.
   */
  registerOp(undoFn, redoFn) {
    // prune any "active" redos
    // ... when "undos" have been applied, there are active "redos" that are no longer possible
    //     BECAUSE of this new user-supplied operation
    while (this.isRedoAvail()) {
      this.stack.pop();
    }

    // register our new entry
    this.stack.push([undoFn, redoFn]);
    this.cur = this.stack.length - 1;
  }


  /**
   * Return an indicator as to whether self's EPkg has "undos" available.
   * 
   * @returns {boolean} `true`: "undos" are available, `false` otherwise.
   */
  isUndoAvail() {
    // undo is available whenever we have active entries
    // ... NOTE: we use index NOT this.stack.length BECAUSE 
    //           the stack (array) is preserved during active undo (for redo activation)
    return this.cur >= 0;
  }

  /**
   * Apply an "undo" operation to self's EPkg.
   */
  applyUndo() {
    // verify context ... we must have an undo available
    const check = verify.prefix('*** ERROR *** applyUndo(): ');
    check(this.isUndoAvail(), `ePkgId: '${this.changeManager.ePkg.getEPkgId()}' DOES NOT currently have an "undo" operation available`);

    // locate undoFn
    const [undoFn/*, redoFn*/] = this.stack[this.cur];
    this.cur--;

    // apply the undoFn
    applyChange(check, this.changeManager.ePkg, undoFn, undefined/*redo: N/A for undo*/);
  }

  /**
   * Return an indicator as to whether self's EPkg has "redos" available.
   * 
   * @returns {boolean} `true`: "redos" are available, `false` otherwise.
   */
  isRedoAvail() {
    // redo is available when an "active" undo has been applied
    // ... i.e. an undo executed -AND- no other changes have been executed
    return this.cur < this.stack.length-1;
  }

  /**
   * Apply an "redo" operation to self's EPkg.
   */
  applyRedo() {
    // verify context ... we must have a redo available
    const check = verify.prefix('*** ERROR *** applyRedo(): ');
    check(this.isUndoAvail(), `ePkgId: '${this.changeManager.ePkg.getEPkgId()}' DOES NOT currently have an "redo" operation available`);

    // locate the redoFn
    this.cur++;
    const [/*undoFn*/, redoFn] = this.stack[this.cur];

    // apply the redoFn
    applyChange(check, this.changeManager.ePkg, redoFn, true/*redo: this is truly a redo!!*/);
  }

}
