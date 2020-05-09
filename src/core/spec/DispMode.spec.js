import DispMode from '../DispMode'; // module under test

describe('DispMode ENUM tests', () => {

  describe('Equality', () => {
    test('equlity', () => expect(DispMode.edit).toBe(DispMode.edit));
  });

  describe('toString', () => {
    test('toString', () => expect(`${DispMode.edit}`).toBe('DispMode.edit'));
  });

  describe('enumKey', () => {
    test('enumKey', () => expect(DispMode.edit.enumKey).toBe('edit'));
  });

  describe('enumOrdinal', () => {
    test('enumOrdinal', () => expect(DispMode.edit.enumOrdinal).toBe(1));
  });

  describe('enumKeys', () => {
    test('enumKeys', () => expect(DispMode.enumKeys).toEqual(['view', 'edit', 'animate']));
  });

  describe('enumValues', () => {
    test('enumValues', () => expect(DispMode.enumValues).toEqual([DispMode.view, DispMode.edit, DispMode.animate]));
  });

  describe('enumValueOf', () => {
    test('enumValueOf', () => expect(DispMode.enumValueOf('edit')).toBe(DispMode.edit));
  });

  describe('iterability', () => {
    // for (const dm of DispMode) {
    //   console.log(dm);
    // }
    const accum = Array.from(DispMode).reduce( (accum, dm) => `${accum}@${dm}`, '');
    test('iterability', () => expect(accum).toBe('@DispMode.view@DispMode.edit@DispMode.animate'));
  });

});
