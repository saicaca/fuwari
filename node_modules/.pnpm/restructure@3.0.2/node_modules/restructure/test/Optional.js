import assert from 'assert';
import {Optional, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Optional', function() {
  describe('decode', function() {
    it('should not decode when condition is falsy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, false);
      assert.equal(optional.decode(stream), null);
      assert.equal(stream.pos, 0);
    });

    it('should not decode when condition is a function and falsy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, function() { return false; });
      assert.equal(optional.decode(stream), null);
      assert.equal(stream.pos, 0);
    });

    it('should decode when condition is omitted', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8);
      assert(optional.decode(stream) != null);
      assert.equal(stream.pos, 1);
    });

    it('should decode when condition is truthy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, true);
      assert(optional.decode(stream) != null);
      assert.equal(stream.pos, 1);
    });

    it('should decode when condition is a function and truthy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, function() { return true; });
      assert(optional.decode(stream) != null);
      assert.equal(stream.pos, 1);
    });
  });

  describe('size', function() {
    it('should return 0 when condition is falsy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, false);
      assert.equal(optional.size(), 0);
    });

    it('should return 0 when condition is a function and falsy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, function() { return false; });
      assert.equal(optional.size(), 0);
    });

    it('should return given type size when condition is omitted', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8);
      assert.equal(optional.size(), 1);
    });

    it('should return given type size when condition is truthy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, true);
      assert.equal(optional.size(), 1);
    });

    it('should return given type size when condition is a function and truthy', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const optional = new Optional(uint8, function() { return true; });
      assert.equal(optional.size(), 1);
    });
  });

  describe('encode', function() {
    it('should not encode when condition is falsy', function() {
      const optional = new Optional(uint8, false);
      assert.deepEqual(optional.toBuffer(128), new Uint8Array(0));
    });

    it('should not encode when condition is a function and falsy', function() {
      const optional = new Optional(uint8, function() { return false; });
      assert.deepEqual(optional.toBuffer(128), new Uint8Array(0));
    });

    it('should encode when condition is omitted', function() {
      const optional = new Optional(uint8);
      assert.deepEqual(optional.toBuffer(128), new Uint8Array([128]));
    });

    it('should encode when condition is truthy', function() {
      const optional = new Optional(uint8, true);
      assert.deepEqual(optional.toBuffer(128), new Uint8Array([128]));
    });

    it('should encode when condition is a function and truthy', function() {
      const optional = new Optional(uint8, function() { return true; });
      assert.deepEqual(optional.toBuffer(128), new Uint8Array([128]));
    });
  });
});
