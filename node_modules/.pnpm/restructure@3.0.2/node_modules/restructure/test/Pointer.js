import assert from 'assert';
import {Pointer, VoidPointer, uint8, DecodeStream, EncodeStream, Struct} from 'restructure';

describe('Pointer', function() {
  describe('decode', function() {
    it('should handle null pointers', function() {
      const stream = new DecodeStream(new Uint8Array([0]));
      const pointer = new Pointer(uint8, uint8);
      return assert.equal(pointer.decode(stream, {_startOffset: 50}), null);
    });

    it('should use local offsets from start of parent by default', function() {
      const stream = new DecodeStream(new Uint8Array([1, 53]));
      const pointer = new Pointer(uint8, uint8);
      assert.equal(pointer.decode(stream, {_startOffset: 0}), 53);
    });

    it('should support immediate offsets', function() {
      const stream = new DecodeStream(new Uint8Array([1, 53]));
      const pointer = new Pointer(uint8, uint8, {type: 'immediate'});
      assert.equal(pointer.decode(stream), 53);
    });

    it('should support offsets relative to the parent', function() {
      const stream = new DecodeStream(new Uint8Array([0, 0, 1, 53]));
      stream.pos = 2;
      const pointer = new Pointer(uint8, uint8, {type: 'parent'});
      assert.equal(pointer.decode(stream, {parent: {_startOffset: 2}}), 53);
    });

    it('should support global offsets', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 4, 0, 0, 0, 53]));
      const pointer = new Pointer(uint8, uint8, {type: 'global'});
      stream.pos = 2;
      assert.equal(pointer.decode(stream, {parent: {parent: {_startOffset: 2}}}), 53);
    });

    it('should support offsets relative to a property on the parent', function() {
      const stream = new DecodeStream(new Uint8Array([1, 0, 0, 0, 0, 53]));
      const pointer = new Pointer(uint8, uint8, {relativeTo: ctx => ctx.parent.ptr});
      assert.equal(pointer.decode(stream, {_startOffset: 0, parent: {ptr: 4}}), 53);
    });

    it('should throw when passing a non function relativeTo option', function() {
      return assert.throws(() => new Pointer(uint8, uint8, {relativeTo: 'parent.ptr'}));
    });

    it('should support returning pointer if there is no decode type', function() {
      const stream = new DecodeStream(new Uint8Array([4]));
      const pointer = new Pointer(uint8, 'void');
      assert.equal(pointer.decode(stream, {_startOffset: 0}), 4);
    });

    it('should support decoding pointers lazily', function() {
      const stream = new DecodeStream(new Uint8Array([1, 53]));
      const struct = new Struct({
        ptr: new Pointer(uint8, uint8, {lazy: true})});

      const res = struct.decode(stream);
      assert.equal(typeof Object.getOwnPropertyDescriptor(res, 'ptr').get, 'function');
      assert.equal(Object.getOwnPropertyDescriptor(res, 'ptr').enumerable, true);
      assert.equal(res.ptr, 53);
    });
  });

  describe('size', function() {
    it('should add to local pointerSize', function() {
      const pointer = new Pointer(uint8, uint8);
      const ctx = {pointerSize: 0};
      assert.equal(pointer.size(10, ctx), 1);
      assert.equal(ctx.pointerSize, 1);
    });

    it('should add to immediate pointerSize', function() {
      const pointer = new Pointer(uint8, uint8, {type: 'immediate'});
      const ctx = {pointerSize: 0};
      assert.equal(pointer.size(10, ctx), 1);
      assert.equal(ctx.pointerSize, 1);
    });

    it('should add to parent pointerSize', function() {
      const pointer = new Pointer(uint8, uint8, {type: 'parent'});
      const ctx = {parent: {pointerSize: 0}};
      assert.equal(pointer.size(10, ctx), 1);
      assert.equal(ctx.parent.pointerSize, 1);
    });

    it('should add to global pointerSize', function() {
      const pointer = new Pointer(uint8, uint8, {type: 'global'});
      const ctx = {parent: {parent: {parent: {pointerSize: 0}}}};
      assert.equal(pointer.size(10, ctx), 1);
      assert.equal(ctx.parent.parent.parent.pointerSize, 1);
    });

    it('should handle void pointers', function() {
      const pointer = new Pointer(uint8, 'void');
      const ctx = {pointerSize: 0};
      assert.equal(pointer.size(new VoidPointer(uint8, 50), ctx), 1);
      assert.equal(ctx.pointerSize, 1);
    });

    it('should throw if no type and not a void pointer', function() {
      const pointer = new Pointer(uint8, 'void');
      const ctx = {pointerSize: 0};
      assert.throws(() => pointer.size(30, ctx));
    });

    it('should return a fixed size without a value', function() {
      const pointer = new Pointer(uint8, uint8);
      assert.equal(pointer.size(), 1);
    });
  });

  describe('encode', function() {
    it('should handle null pointers', function() {
      const ptr = new Pointer(uint8, uint8);
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 0,
        pointers: []
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(null)));
      ptr.encode(stream, null, ctx);
      assert.equal(ctx.pointerSize, 0);

      assert.deepEqual(stream.buffer, new Uint8Array([0]));
    });

    it('should handle local offsets', function() {
      const ptr = new Pointer(uint8, uint8);
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 1,
        pointers: []
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10)));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.pointerOffset, 2);
      assert.deepEqual(ctx.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([1]));
    });

    it('should handle immediate offsets', function() {
      const ptr = new Pointer(uint8, uint8, {type: 'immediate'});
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 1,
        pointers: []
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10)));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.pointerOffset, 2);
      assert.deepEqual(ctx.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([0]));
    });

    it('should handle immediate offsets', function() {
      const ptr = new Pointer(uint8, uint8, {type: 'immediate'});
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 1,
        pointers: []
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10)));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.pointerOffset, 2);
      assert.deepEqual(ctx.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([0]));
    });

    it('should handle offsets relative to parent', function() {
      const ptr = new Pointer(uint8, uint8, {type: 'parent'});
      const ctx = {
        parent: {
          pointerSize: 0,
          startOffset: 3,
          pointerOffset: 5,
          pointers: []
        }
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10, {parent: {...ctx.parent}})));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.parent.pointerOffset, 6);
      assert.deepEqual(ctx.parent.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([2]));
    });

    it('should handle global offsets', function() {
      const ptr = new Pointer(uint8, uint8, {type: 'global'});
      const ctx = {
        parent: {
          parent: {
            parent: {
              pointerSize: 0,
              startOffset: 3,
              pointerOffset: 5,
              pointers: []
            }
          }
        }
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10, JSON.parse(JSON.stringify(ctx)))));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.parent.parent.parent.pointerOffset, 6);
      assert.deepEqual(ctx.parent.parent.parent.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([5]));
    });

    it('should support offsets relative to a property on the parent', function() {
      const ptr = new Pointer(uint8, uint8, {relativeTo: ctx => ctx.ptr});
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 10,
        pointers: [],
        val: {
          ptr: 4
        }
      };

      const stream = new EncodeStream(new Uint8Array(ptr.size(10, {...ctx})));
      ptr.encode(stream, 10, ctx);
      assert.equal(ctx.pointerOffset, 11);
      assert.deepEqual(ctx.pointers, [
        { type: uint8, val: 10, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([6]));
    });

    it('should support void pointers', function() {
      const ptr = new Pointer(uint8, 'void');
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 1,
        pointers: []
      };

      const val = new VoidPointer(uint8, 55);
      const stream = new EncodeStream(new Uint8Array(ptr.size(val, {...ctx})));
      ptr.encode(stream, val, ctx);
      assert.equal(ctx.pointerOffset, 2);
      assert.deepEqual(ctx.pointers, [
        { type: uint8, val: 55, parent: ctx }
      ]);

      assert.deepEqual(stream.buffer, new Uint8Array([1]));
    });

    it('should throw if not a void pointer instance', function() {
      const ptr = new Pointer(uint8, 'void');
      const ctx = {
        pointerSize: 0,
        startOffset: 0,
        pointerOffset: 1,
        pointers: []
      };

      const stream = new EncodeStream(new Uint8Array(0));
      assert.throws(() => ptr.encode(stream, 44, ctx));
    });
  });
});
