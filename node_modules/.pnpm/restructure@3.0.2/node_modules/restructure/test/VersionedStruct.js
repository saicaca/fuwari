import assert from 'assert';
import {VersionedStruct, String as StringT, Pointer, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('VersionedStruct', function() {
  describe('decode', function() {
    it('should get version from number type', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      let stream = new DecodeStream(Buffer.from('\x00\x05devon\x15'));
      assert.deepEqual(struct.decode(stream), {
        version: 0,
        name: 'devon',
        age: 21
      });

      stream = new DecodeStream(Buffer.from('\x01\x0adevon 👍\x15\x00', 'utf8'));
      assert.deepEqual(struct.decode(stream), {
        version: 1,
        name: 'devon 👍',
        age: 21,
        gender: 0
      });
    });

    it('should throw for unknown version', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      const stream = new DecodeStream(Buffer.from('\x05\x05devon\x15'));
      return assert.throws(() => struct.decode(stream));
    });

    it('should support common header block', function() {
      const struct = new VersionedStruct(uint8, {
        header: {
          age: uint8,
          alive: uint8
        },
        0: {
          name: new StringT(uint8, 'ascii')
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          gender: uint8
        }
      }
      );

      let stream = new DecodeStream(Buffer.from('\x00\x15\x01\x05devon'));
      assert.deepEqual(struct.decode(stream), {
        version: 0,
        age: 21,
        alive: 1,
        name: 'devon'
      });

      stream = new DecodeStream(Buffer.from('\x01\x15\x01\x0adevon 👍\x00', 'utf8'));
      assert.deepEqual(struct.decode(stream), {
        version: 1,
        age: 21,
        alive: 1,
        name: 'devon 👍',
        gender: 0
      });
    });

    it('should support parent version key', function() {
      const struct = new VersionedStruct('version', {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      let stream = new DecodeStream(Buffer.from('\x05devon\x15'));
      assert.deepEqual(struct.decode(stream, {version: 0}), {
        version: 0,
        name: 'devon',
        age: 21
      });

      stream = new DecodeStream(Buffer.from('\x0adevon 👍\x15\x00', 'utf8'));
      assert.deepEqual(struct.decode(stream, {version: 1}), {
        version: 1,
        name: 'devon 👍',
        age: 21,
        gender: 0
      });
    });

    it('should support parent version nested key', function() {
      const struct = new VersionedStruct('obj.version', {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      let stream = new DecodeStream(Buffer.from('\x05devon\x15'));
      assert.deepEqual(struct.decode(stream, {obj: {version: 0}}), {
        version: 0,
        name: 'devon',
        age: 21
      });

      stream = new DecodeStream(Buffer.from('\x0adevon 👍\x15\x00', 'utf8'));
      assert.deepEqual(struct.decode(stream, {obj: {version: 1}}), {
        version: 1,
        name: 'devon 👍',
        age: 21,
        gender: 0
      });
    });

    it('should support sub versioned structs', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: new VersionedStruct(uint8, {
          0: {
            name: new StringT(uint8)
          },
          1: {
            name: new StringT(uint8),
            isDesert: uint8
          }
        }
        )
      }
      );

      let stream = new DecodeStream(Buffer.from('\x00\x05devon\x15'));
      assert.deepEqual(struct.decode(stream, {version: 0}), {
        version: 0,
        name: 'devon',
        age: 21
      });

      stream = new DecodeStream(Buffer.from('\x01\x00\x05pasta'));
      assert.deepEqual(struct.decode(stream, {version: 0}), {
        version: 0,
        name: 'pasta'
      });

      stream = new DecodeStream(Buffer.from('\x01\x01\x09ice cream\x01'));
      assert.deepEqual(struct.decode(stream, {version: 0}), {
        version: 1,
        name: 'ice cream',
        isDesert: 1
      });
    });

    it('should support process hook', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      struct.process = function() {
        return this.processed = true;
      };

      const stream = new DecodeStream(Buffer.from('\x00\x05devon\x15'));
      assert.deepEqual(struct.decode(stream), {
        version: 0,
        name: 'devon',
        age: 21,
        processed: true
      });
    });
  });

  describe('size', function() {
    it('should compute the correct size', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      let size = struct.size({
        version: 0,
        name: 'devon',
        age: 21
      });

      assert.equal(size, 8);

      size = struct.size({
        version: 1,
        name: 'devon 👍',
        age: 21,
        gender: 0
      });

      assert.equal(size, 14);
    });

    it('should throw for unknown version', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      assert.throws(() =>
        struct.size({
          version: 5,
          name: 'devon',
          age: 21
        })
      );
    });

    it('should support common header block', function() {
      const struct = new VersionedStruct(uint8, {
        header: {
          age: uint8,
          alive: uint8
        },
        0: {
          name: new StringT(uint8, 'ascii')
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          gender: uint8
        }
      }
      );

      let size = struct.size({
        version: 0,
        age: 21,
        alive: 1,
        name: 'devon'
      });

      assert.equal(size, 9);

      size = struct.size({
        version: 1,
        age: 21,
        alive: 1,
        name: 'devon 👍',
        gender: 0
      });

      assert.equal(size, 15);
    });

    it('should compute the correct size with pointers', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          ptr: new Pointer(uint8, new StringT(uint8))
        }
      }
      );

      const size = struct.size({
        version: 1,
        name: 'devon',
        age: 21,
        ptr: 'hello'
      });

      assert.equal(size, 15);
    });

    it('should throw if no value is given', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(4, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(4, 'utf8'),
          age: uint8,
          gender: uint8
        }
      }
      );

      assert.throws(() => struct.size(), /not a fixed size/i);
    });
  });

  describe('encode', function() {
    it('should encode objects to buffers', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      });

      const buf1 = struct.toBuffer({
        version: 0,
        name: 'devon',
        age: 21
      });

      assert.deepEqual(buf1,  Buffer.from('\x00\x05devon\x15', 'utf8'));

      const buf2 = struct.toBuffer({
        version: 1,
        name: 'devon 👍',
        age: 21,
        gender: 0
      });

      assert.deepEqual(buf2,  Buffer.from('\x01\x0adevon 👍\x15\x00', 'utf8'));
    });

    it('should throw for unknown version', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      });

      assert.throws(() =>
        struct.toBuffer({
          version: 5,
          name: 'devon',
          age: 21
        })
      );
    });

    it('should support common header block', function() {
      const struct = new VersionedStruct(uint8, {
        header: {
          age: uint8,
          alive: uint8
        },
        0: {
          name: new StringT(uint8, 'ascii')
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          gender: uint8
        }
      });

      const buf1 = struct.toBuffer({
        version: 0,
        age: 21,
        alive: 1,
        name: 'devon'
      });

      assert.deepEqual(buf1, Buffer.from('\x00\x15\x01\x05devon', 'utf8'));

      const buf2 = struct.toBuffer({
        version: 1,
        age: 21,
        alive: 1,
        name: 'devon 👍',
        gender: 0
      });

      assert.deepEqual(buf2, Buffer.from('\x01\x15\x01\x0adevon 👍\x00', 'utf8'));
    });

    it('should encode pointer data after structure', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          ptr: new Pointer(uint8, new StringT(uint8))
        }
      });

      const buf = struct.toBuffer({
        version: 1,
        name: 'devon',
        age: 21,
        ptr: 'hello'
      });

      assert.deepEqual(buf, Buffer.from('\x01\x05devon\x15\x09\x05hello', 'utf8'));
    });

    it('should support preEncode hook', function() {
      const struct = new VersionedStruct(uint8, {
        0: {
          name: new StringT(uint8, 'ascii'),
          age: uint8
        },
        1: {
          name: new StringT(uint8, 'utf8'),
          age: uint8,
          gender: uint8
        }
      });

      struct.preEncode = function() {
        return this.version = (this.gender != null) ? 1 : 0;
      };

      const buf1 = struct.toBuffer({
        name: 'devon',
        age: 21
      });

      assert.deepEqual(buf1, Buffer.from('\x00\x05devon\x15', 'utf8'));

      const buf2 = struct.toBuffer({
        name: 'devon 👍',
        age: 21,
        gender: 0
      });

      assert.deepEqual(buf2, Buffer.from('\x01\x0adevon 👍\x15\x00', 'utf8'));
    });
  });
});
