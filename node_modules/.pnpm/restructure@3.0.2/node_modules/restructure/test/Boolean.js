import assert from 'assert';
import {Boolean, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Boolean', function() {
  describe('decode', function() {
    it('should decode 0 as false', function() {
      const buffer = new Uint8Array([0]);
      const boolean = new Boolean(uint8);
      assert.deepEqual(boolean.fromBuffer(buffer), false);
    });

    it('should decode 1 as true', function() {
      const buffer = new Uint8Array([1]);
      const boolean = new Boolean(uint8);
      assert.deepEqual(boolean.fromBuffer(buffer), true);
    });
  });

  describe('size', () =>
    it('should return given type size', function() {
      const boolean = new Boolean(uint8);
      assert.deepEqual(boolean.size(), 1);
    })
  );

  describe('encode', function() {
    it('should encode false as 0', function() {
      const boolean = new Boolean(uint8);
      const buffer = boolean.toBuffer(false);
      assert.deepEqual(buffer, Buffer.from([0]));
    });

    it('should encode true as 1', function() {
      const boolean = new Boolean(uint8);
      const buffer = boolean.toBuffer(true);
      assert.deepEqual(buffer, Buffer.from([1]));
    });
  });
});
