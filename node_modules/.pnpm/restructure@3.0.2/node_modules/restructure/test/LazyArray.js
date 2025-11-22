import assert from 'assert';
import {LazyArray, Pointer, uint8, uint16, DecodeStream, EncodeStream} from 'restructure';

describe('LazyArray', function() {
  describe('decode', function() {
    it('should decode items lazily', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new LazyArray(uint8, 4);

      const arr = array.decode(stream);
      assert(!(arr instanceof Array));
      assert.equal(arr.length, 4);
      assert.equal(stream.pos, 4);

      assert.equal(arr.get(0), 1);
      assert.equal(arr.get(1), 2);
      assert.equal(arr.get(2), 3);
      assert.equal(arr.get(3), 4);

      assert.equal(arr.get(-1), null);
      assert.equal(arr.get(5), null);
    });

    it('should be able to convert to an array', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new LazyArray(uint8, 4);

      const arr = array.decode(stream);
      assert.deepEqual(arr.toArray(), [1, 2, 3, 4]);
    });

    it('should decode length as number before array', function() {
      const stream = new DecodeStream(new Uint8Array([4, 1, 2, 3, 4, 5]));
      const array = new LazyArray(uint8, uint8);
      const arr = array.decode(stream);

      assert.deepEqual(arr.toArray(), [1, 2, 3, 4]);
    });
  });

  describe('size', () =>
    it('should work with LazyArrays', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new LazyArray(uint8, 4);
      const arr = array.decode(stream);

      assert.equal(array.size(arr), 4);
    })
  );

  describe('encode', () =>
    it('should work with LazyArrays', function() {
      const array = new LazyArray(uint8, 4);
      const arr = array.fromBuffer(new Uint8Array([1, 2, 3, 4, 5]));
      const buffer = array.toBuffer(arr);
      assert.deepEqual(buffer, new Uint8Array([1, 2, 3, 4]));
    })
  );
});
