import crcUtil from 'crc';       // usage: crcUtil.crc32(valStr, accumCrc) ... below
//import crc32 from 'crc/crc32'; // usage: crc32(valStr, accumCrc)         ... below

// NOTE: Would prefer 2nd import option (above)
//       BECAUSE: It only imports the crc32 code (NOT bloating our bundle size)
//       HOWEVER: It generates a "SyntaxError: Unexpected token {" in our jest test usage
//       GOOGLE:  crc Jest encountered an unexpected token
//       SUSPECT: NOT: This may be related to how my project config uses 'src/' as our import root
//       SUSPECT: This is some babel 7 issue with jest
//       FIX:     I punted for now.
//                ONE "last resort" option would be to locally include code from crc pkg
//                ... see journal.txt for details

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

  return crcUtil.crc32(valStr, accumCrc);
//return crc32(valStr, accumCrc);
}
