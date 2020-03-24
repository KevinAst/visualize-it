import crc  from '../crc'; // modules under test

describe('crc tests', () => {

  function doTest(type, val) {
    const crcVal  = crc(val);
    const crcVal2 = crc(val);

    // console.log(`xx Testing type: ${type} ... crc(${val}): ${crcVal} ... hex: ${crcVal.toString(16)}`);

    test('consistent', () => {
      expect(crcVal).toEqual(crcVal2);
    });
  }

  describe('string', () => {
    doTest('string', 'This is a test');
  });

  
  describe('number', () => {
    doTest('number', 123);
  });
  
  describe('boolean', () => {
    doTest('boolean', true);
    doTest('boolean', false);
  });
  
  describe('array of primitives', () => {
    doTest('array of primitives', [1, 'my-string', true]);
  });
  
  describe('array of objects', () => { // NOTE: be careful with this ... it generates non-unique CRC, because our objects have no toString() ... [object Object],[object Object]
    doTest('array of objects', [{a:'a', b:'b'}, {c:'c', d:'d'}]);
  });

  describe('undefined', () => { // hmmm ... works because we convert val to string 'undefined'
    doTest('undefined', undefined);
  });

  describe('null', () => { // hmmm ... works because we convert val to string 'null'
    doTest('null', null);
  });
  
  describe('accumulation', () => {
  
    const myStr  = 'This is a test';
    const myNum  = 123;
    const myBool = false;
  
    let crcVal  = crc(myStr);
    crcVal = crc(myNum, crcVal);
    crcVal = crc(myBool, crcVal);
    // console.log(`xx Testing accumulation ... crc(...accumulation) crcVal: ${crcVal} ... hex: ${crcVal.toString(16)}`);
    test('accumulative', () => {
      expect(crcVal).not.toEqual(crc(myBool));
    });
  
    let crcVal2  = crc(myStr);
    crcVal2 = crc(myNum, crcVal2);
    crcVal2 = crc(myBool, crcVal2);
    // console.log(`xx Testing accumulation ... crc(...accumulation) crcVal2: ${crcVal2} ... hex: ${crcVal2.toString(16)}`);
    test('consistent', () => {
      expect(crcVal).toEqual(crcVal2);
    });

    let crcVal3  = crc(myBool);
    crcVal3 = crc(myStr, crcVal3);
    crcVal3 = crc(myNum, crcVal3);
    // console.log(`xx Testing accumulation ... crc(...accumulation) crcVal3: ${crcVal3} ... hex: ${crcVal3.toString(16)}`);
    test('order matters', () => {
      expect(crcVal2).not.toEqual(crcVal3);
    });
    
  });

});
