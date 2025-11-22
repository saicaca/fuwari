import assert from 'assert';
import {Struct, String as StringT, Pointer, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Struct', function() {
  describe('decode', function() {
    it('should decode into an object', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8
      });

      assert.deepEqual(struct.fromBuffer(Buffer.from('\x05devon\x15')), {
        name: 'devon',
        age: 21
      });
    });

    it('should support process hook', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8
      });

      struct.process = function() {
        return this.canDrink = this.age >= 21;
      };

      assert.deepEqual(struct.fromBuffer(Buffer.from('\x05devon\x20')), {
        name: 'devon',
        age: 32,
        canDrink: true
      });
    });

    it('should support function keys', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8,
        canDrink() { return this.age >= 21; }
      });

      assert.deepEqual(struct.fromBuffer(Buffer.from('\x05devon\x20')), {
        name: 'devon',
        age: 32,
        canDrink: true
      });
    });
  });

  describe('size', function() {
    it('should compute the correct size', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8
      });

      assert.equal(struct.size({name: 'devon', age: 21}), 7);
    });

    it('should compute the correct size with pointers', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8,
        ptr: new Pointer(uint8, new StringT(uint8))
      });

      const size = struct.size({
        name: 'devon',
        age: 21,
        ptr: 'hello'
      });

      assert.equal(size, 14);
    });

    it('should get the correct size when no value is given', function() {
      const struct = new Struct({
        name: new StringT(4),
        age: uint8
      });

      assert.equal(struct.size(), 5);
    });

    it('should throw when getting non-fixed length size and no value is given', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8
      });

      assert.throws(() => struct.size(), /not a fixed size/i);
    });
  });

  describe('encode', function() {
    it('should encode objects to buffers', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8
      });

      const buf = struct.toBuffer({
        name: 'devon',
        age: 21
      });

      assert.deepEqual(buf, Buffer.from('\x05devon\x15'));
    });

    it('should support preEncode hook', function() {
      const struct = new Struct({
        nameLength: uint8,
        name: new StringT('nameLength'),
        age: uint8
      });

      struct.preEncode = function() {
        return this.nameLength = this.name.length;
      };

      const buf = struct.toBuffer({
        name: 'devon',
        age: 21
      });

      assert.deepEqual(buf, Buffer.from('\x05devon\x15'));
    });

    it('should encode pointer data after structure', function() {
      const struct = new Struct({
        name: new StringT(uint8),
        age: uint8,
        ptr: new Pointer(uint8, new StringT(uint8))
      });

      const buf = struct.toBuffer({
        name: 'devon',
        age: 21,
        ptr: 'hello'
      });

      assert.deepEqual(buf, Buffer.from('\x05devon\x15\x08\x05hello'));
    });
  });
});

