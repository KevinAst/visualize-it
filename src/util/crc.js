// ?? import crc32 from 'crc/crc32'; // ?? would like to do this ... however: get a SyntaxError: Unexpected token {
import crcUtil from 'crc'; // ?? this works, HOWEVER it imports everything and bloats our bundle size :-(

/**
 * Generate a crc value from the supplied parameters.
 *
 * @param {any} val - the value to include in the crc.  Supports:
 *  - any primitive type (string, number, boolean)
 *  - array of primitive types
 *  - any object with a toString() representative of the object state
 *  - undefined/null
 *  WARNING:
 *  - all other cases will generate a non-unique crc
 *
 * @param {number} [accumCrc] - an optional crc value, used when
 * accumulating additional items in your crc computation.
 *
 * @return {number} the generated crc value.
 */
export default function crc(val, accumCrc=0) {
  // convert val to string
  const valStr = '' + val;
  // console.log(`xx val: ${val}, valStr: ${valStr}`);

//return crc32(valStr, accumCrc);
  return crcUtil.crc32(valStr, accumCrc);
}
