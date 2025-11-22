import assert from 'assert';
import {Array as ArrayT, Pointer, uint8, uint16, DecodeStream, EncodeStream} from 'restructure';

describe('Array', function() {
  describe('decode', function() {
    it('should decode fixed length', function() {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const array = new ArrayT(uint8, 4);
      assert.deepEqual(array.fromBuffer(buffer), [1, 2, 3, 4]);
    });

    it('should decode fixed amount of bytes', function() {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const array = new ArrayT(uint16, 4, 'bytes');
      assert.deepEqual(array.fromBuffer(buffer), [258, 772]);
    });

    it('should decode length from parent key', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new ArrayT(uint8, 'len');
      assert.deepEqual(array.decode(stream, {len: 4}), [1, 2, 3, 4]);
    });

    it('should decode amount of bytes from parent key', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new ArrayT(uint16, 'len', 'bytes');
      assert.deepEqual(array.decode(stream, {len: 4}), [258, 772]);
    });

    it('should decode length as number before array', function() {
      const buffer = new Uint8Array([4, 1, 2, 3, 4, 5]);
      const array = new ArrayT(uint8, uint8);
      assert.deepEqual(array.fromBuffer(buffer), [1, 2, 3, 4]);
    });

    it('should decode amount of bytes as number before array', function() {
      const buffer = new Uint8Array([4, 1, 2, 3, 4, 5]);
      const array = new ArrayT(uint16, uint8, 'bytes');
      assert.deepEqual(array.fromBuffer(buffer), [258, 772]);
    });

    it('should decode length from function', function() {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const array = new ArrayT(uint8, function() { return 4; });
      assert.deepEqual(array.fromBuffer(buffer), [1, 2, 3, 4]);
    });

    it('should decode amount of bytes from function', function() {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const array = new ArrayT(uint16, (function() { return 4; }), 'bytes');
      assert.deepEqual(array.fromBuffer(buffer), [258, 772]);
    });

    it('should decode to the end of the parent if no length is given', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3, 4, 5]));
      const array = new ArrayT(uint8);
      assert.deepEqual(array.decode(stream, {_length: 4, _startOffset: 0}), [1, 2, 3, 4]);
    });

    it('should decode to the end of the stream if no parent and length is given', function() {
      const buffer = new Uint8Array([1, 2, 3, 4]);
      const array = new ArrayT(uint8);
      assert.deepEqual(array.fromBuffer(buffer), [1, 2, 3, 4]);
    });
  });

  describe('size', function() {
    it('should use array length', function() {
      const array = new ArrayT(uint8, 10);
      assert.equal(array.size([1, 2, 3, 4]), 4);
    });

    it('should add size of length field before string', function() {
      const array = new ArrayT(uint8, uint8);
      assert.equal(array.size([1, 2, 3, 4]), 5);
    });

    it('should use defined length if no value given', function() {
      const array = new ArrayT(uint8, 10);
      assert.equal(array.size(), 10);
    });
  });

  describe('encode', function() {
    it('should encode using array length', function() {
      const array = new ArrayT(uint8, 10);
      const buffer = array.toBuffer([1, 2, 3, 4]);
      assert.deepEqual(buffer, new Uint8Array([1, 2, 3, 4]));
    });

    it('should encode length as number before array', function() {
      const array = new ArrayT(uint8, uint8);
      const buffer = array.toBuffer([1, 2, 3, 4]);
      assert.deepEqual(buffer, new Uint8Array([4, 1, 2, 3, 4]));
    });

    it('should add pointers after array if length is encoded at start', function() {
      const array = new ArrayT(new Pointer(uint8, uint8), uint8);
      const buffer = array.toBuffer([1, 2, 3, 4]);
      assert.deepEqual(buffer, new Uint8Array([4, 5, 6, 7, 8, 1, 2, 3, 4]));
    });
  });
});
