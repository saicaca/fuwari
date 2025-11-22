import assert from 'assert';
import {Buffer as BufferT, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Buffer', function() {
  describe('decode', function() {
    it('should decode', function() {
      const buffer = new Uint8Array([0xab, 0xff]);
      const buf = new BufferT(2);
      assert.deepEqual(buf.fromBuffer(buffer), new Uint8Array([0xab, 0xff]));
  });

    it('should decode with parent key length', function() {
      const stream = new DecodeStream(new Uint8Array([0xab, 0xff, 0x1f, 0xb6]));
      const buf = new BufferT('len');
      assert.deepEqual(buf.decode(stream, {len: 3}), new Uint8Array([0xab, 0xff, 0x1f]));
      assert.deepEqual(buf.decode(stream, {len: 1}), new Uint8Array([0xb6]));
  });
});

  describe('size', function() {
    it('should return size', function() {
      const buf = new BufferT(2);
      assert.equal(buf.size(new Uint8Array([0xab, 0xff])), 2);
    });

    it('should use defined length if no value given', function() {
      const array = new BufferT(10);
      assert.equal(array.size(), 10);
    });
  });

  describe('encode', function() {
    it('should encode', function() {
      const buf = new BufferT(2);
      const buffer = buf.toBuffer(new Uint8Array([0xab, 0xff]));
      assert.deepEqual(buffer, new Uint8Array([0xab, 0xff]));
    });

    it('should encode length before buffer', function() {
      const buf = new BufferT(uint8);
      const buffer = buf.toBuffer(new Uint8Array([0xab, 0xff]));
      assert.deepEqual(buffer, new Uint8Array([2, 0xab, 0xff]));
    });
  });
});
