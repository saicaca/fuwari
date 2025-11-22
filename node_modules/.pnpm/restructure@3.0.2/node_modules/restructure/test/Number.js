import {
  uint8,
  uint16, uint16be, uint16le,
  uint24, uint24be, uint24le,
  uint32, uint32be, uint32le,
  int8,
  int16, int16be, int16le,
  int24, int24be, int24le,
  int32, int32be, int32le,
  float, floatbe, floatle,
  double, doublebe, doublele,
  fixed16, fixed16be, fixed16le,
  fixed32, fixed32be, fixed32le,
  DecodeStream, EncodeStream
} from 'restructure';
import assert from 'assert';

describe('Number', function() {
  describe('uint8', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xab, 0xff]));
      assert.equal(uint8.decode(stream), 0xab);
      assert.equal(uint8.decode(stream), 0xff);
    });

    it('should have a size', () => assert.equal(uint8.size(), 1));

    it('should encode', function() {
      assert.deepEqual(uint8.toBuffer(0xab), new Uint8Array([0xab]));
      assert.deepEqual(uint8.toBuffer(0xff), new Uint8Array([0xff]));
    });
  });

  describe('uint16', () =>
    it('is an alias for uint16be', () => assert.deepEqual(uint16, uint16be))
  );

  describe('uint16be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xab, 0xff]));
      assert.equal(uint16be.decode(stream), 0xabff);
    });

    it('should have a size', () => assert.equal(uint16be.size(), 2));

    it('should encode', function() {
      assert.deepEqual(uint16be.toBuffer(0xabff), new Uint8Array([0xab, 0xff]));
    });
  });

  describe('uint16le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab]));
      assert.equal(uint16le.decode(stream), 0xabff);
    });

    it('should have a size', () => assert.equal(uint16le.size(), 2));

    it('should encode', function() {
      assert.deepEqual(uint16le.toBuffer(0xabff), new Uint8Array([0xff, 0xab]));
    });
  });

  describe('uint24', () =>
    it('is an alias for uint24be', () => assert.deepEqual(uint24, uint24be))
  );

  describe('uint24be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab, 0x24]));
      assert.equal(uint24be.decode(stream), 0xffab24);
    });

    it('should have a size', () => assert.equal(uint24be.size(), 3));

    it('should encode', function() {
      assert.deepEqual(uint24be.toBuffer(0xffab24), new Uint8Array([0xff, 0xab, 0x24]));
    });
  });

  describe('uint24le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0x24, 0xab, 0xff]));
      assert.equal(uint24le.decode(stream), 0xffab24);
    });

    it('should have a size', () => assert.equal(uint24le.size(), 3));

    it('should encode', function() {
      assert.deepEqual(uint24le.toBuffer(0xffab24), new Uint8Array([0x24, 0xab, 0xff]));
    });
  });

  describe('uint32', () =>
    it('is an alias for uint32be', () => assert.deepEqual(uint32, uint32be))
  );

  describe('uint32be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab, 0x24, 0xbf]));
      assert.equal(uint32be.decode(stream), 0xffab24bf);
    });

    it('should have a size', () => assert.equal(uint32be.size(), 4));

    it('should encode', function() {
      assert.deepEqual(uint32be.toBuffer(0xffab24bf), new Uint8Array([0xff, 0xab, 0x24, 0xbf]));
    });
  });

  describe('uint32le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xbf, 0x24, 0xab, 0xff]));
      assert.equal(uint32le.decode(stream), 0xffab24bf);
    });

    it('should have a size', () => assert.equal(uint32le.size(), 4));

    it('should encode', function() {
      assert.deepEqual(uint32le.toBuffer(0xffab24bf), new Uint8Array([0xbf, 0x24, 0xab, 0xff]));
    });
  });

  describe('int8', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0x7f, 0xff]));
      assert.equal(int8.decode(stream), 127);
      assert.equal(int8.decode(stream), -1);
    });

    it('should have a size', () => assert.equal(int8.size(), 1));

    it('should encode', function() {
      assert.deepEqual(uint8.toBuffer(127), new Uint8Array([0x7f]));
      assert.deepEqual(uint8.toBuffer(-1), new Uint8Array([0xff]));
    });
  });

  describe('int16', () =>
    it('is an alias for int16be', () => assert.deepEqual(int16, int16be))
  );

  describe('int16be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab]));
      assert.equal(int16be.decode(stream), -85);
    });

    it('should have a size', () => assert.equal(int16be.size(), 2));

    it('should encode', function() {
      assert.deepEqual(int16be.toBuffer(-85), new Uint8Array([0xff, 0xab]));
    });
  });

  describe('int16le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xab, 0xff]));
      assert.equal(int16le.decode(stream), -85);
    });

    it('should have a size', () => assert.equal(int16le.size(), 2));

    it('should encode', function() {
      assert.deepEqual(int16le.toBuffer(-85), new Uint8Array([0xab, 0xff]));
    });
  });

  describe('int24', () =>
    it('is an alias for int24be', () => assert.deepEqual(int24, int24be))
  );

  describe('int24be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab, 0x24]));
      assert.equal(int24be.decode(stream), -21724);
    });

    it('should have a size', () => assert.equal(int24be.size(), 3));

    it('should encode', function() {
      assert.deepEqual(int24be.toBuffer(-21724), new Uint8Array([0xff, 0xab, 0x24]));
    });
  });

  describe('int24le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0x24, 0xab, 0xff]));
      assert.equal(int24le.decode(stream), -21724);
    });

    it('should have a size', () => assert.equal(int24le.size(), 3));

    it('should encode', function() {
      assert.deepEqual(int24le.toBuffer(-21724), new Uint8Array([0x24, 0xab, 0xff]));
    });
  });

  describe('int32', () =>
    it('is an alias for int32be', () => assert.deepEqual(int32, int32be))
  );

  describe('int32be', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xff, 0xab, 0x24, 0xbf]));
      assert.equal(int32be.decode(stream), -5561153);
    });

    it('should have a size', () => assert.equal(int32be.size(), 4));

    it('should encode', function() {
      assert.deepEqual(int32be.toBuffer(-5561153), new Uint8Array([0xff, 0xab, 0x24, 0xbf]));
    });
  });

  describe('int32le', function() {
    it('should decode', function() {
      const stream = new DecodeStream(new Uint8Array([0xbf, 0x24, 0xab, 0xff]));
      assert.equal(int32le.decode(stream), -5561153);
    });

    it('should have a size', () => assert.equal(int32le.size(), 4));

    it('should encode', function() {
      assert.deepEqual(int32le.toBuffer(-5561153), new Uint8Array([0xbf, 0x24, 0xab, 0xff]));
    });
  });

  describe('float', () =>
    it('is an alias for floatbe', () => assert.deepEqual(float, floatbe))
  );

  describe('floatbe', function() {
    it('should decode', function() {
      const value = floatbe.fromBuffer(new Uint8Array([0x43, 0x7a, 0x8c, 0xcd]));
      assert(value >= 250.55 - 0.005);
      assert(value <= 250.55 + 0.005);
    });

    it('should have a size', () => assert.equal(floatbe.size(), 4));

    it('should encode', function() {
      assert.deepEqual(floatbe.toBuffer(250.55), new Uint8Array([0x43, 0x7a, 0x8c, 0xcd]));
    });
  });

  describe('floatle', function() {
    it('should decode', function() {
      const value = floatle.fromBuffer(new Uint8Array([0xcd, 0x8c, 0x7a, 0x43]));
      assert(value >= 250.55 - 0.005);
      assert(value <= 250.55 + 0.005);
    });

    it('should have a size', () => assert.equal(floatle.size(), 4));

    it('should encode', function() {
      assert.deepEqual(floatle.toBuffer(250.55), new Uint8Array([0xcd, 0x8c, 0x7a, 0x43]));
    });
  });

  describe('double', () =>
    it('is an alias for doublebe', () => assert.deepEqual(double, doublebe))
  );

  describe('doublebe', function() {
    it('should decode', function() {
      const value = doublebe.fromBuffer(new Uint8Array([0x40, 0x93, 0x4a, 0x3d, 0x70, 0xa3, 0xd7, 0x0a]));
      assert(value >= 1234.56 - 0.005);
      assert(value <= 1234.56 + 0.005);
    });

    it('should have a size', () => assert.equal(doublebe.size(), 8));

    it('should encode', function() {
      assert.deepEqual(doublebe.toBuffer(1234.56), new Uint8Array([0x40, 0x93, 0x4a, 0x3d, 0x70, 0xa3, 0xd7, 0x0a]));
    });
  });

  describe('doublele', function() {
    it('should decode', function() {
      const value = doublele.fromBuffer(new Uint8Array([0x0a, 0xd7, 0xa3, 0x70, 0x3d, 0x4a, 0x93, 0x40]));
      assert(value >= 1234.56 - 0.005);
      assert(value <= 1234.56 + 0.005);
    });

    it('should have a size', () => assert.equal(doublele.size(), 8));

    it('should encode', function() {
      assert.deepEqual(doublele.toBuffer(1234.56), new Uint8Array([0x0a, 0xd7, 0xa3, 0x70, 0x3d, 0x4a, 0x93, 0x40]));
    });
  });

  describe('fixed16', () =>
    it('is an alias for fixed16be', () => assert.deepEqual(fixed16, fixed16be))
  );

  describe('fixed16be', function() {
    it('should decode', function() {
      const value = fixed16be.fromBuffer(new Uint8Array([0x19, 0x57]));
      assert(value >= 25.34 - 0.005);
      assert(value <= 25.34 + 0.005);
    });

    it('should have a size', () => assert.equal(fixed16be.size(), 2));

    it('should encode', function() {
      assert.deepEqual(fixed16be.toBuffer(25.34), new Uint8Array([0x19, 0x57]));
    });
  });

  describe('fixed16le', function() {
    it('should decode', function() {
      const value = fixed16le.fromBuffer(new Uint8Array([0x57, 0x19]));
      assert(value >= 25.34 - 0.005);
      assert(value <= 25.34 + 0.005);
    });

    it('should have a size', () => assert.equal(fixed16le.size(), 2));

    it('should encode', function() {
      assert.deepEqual(fixed16le.toBuffer(25.34), new Uint8Array([0x57, 0x19]));
    });
  });

  describe('fixed32', () =>
    it('is an alias for fixed32be', () => assert.deepEqual(fixed32, fixed32be))
  );

  describe('fixed32be', function() {
    it('should decode', function() {
      const value = fixed32be.fromBuffer(new Uint8Array([0x00, 0xfa, 0x8c, 0xcc]));
      assert(value >= 250.55 - 0.005);
      assert(value <= 250.55 + 0.005);
    });

    it('should have a size', () => assert.equal(fixed32be.size(), 4));

    it('should encode', function() {
      assert.deepEqual(fixed32be.toBuffer(250.55), new Uint8Array([0x00, 0xfa, 0x8c, 0xcc]));
    });
  });

  describe('fixed32le', function() {
    it('should decode', function() {
      const value = fixed32le.fromBuffer(new Uint8Array([0xcc, 0x8c, 0xfa, 0x00]));
      assert(value >= 250.55 - 0.005);
      assert(value <= 250.55 + 0.005);
    });

    it('should have a size', () => assert.equal(fixed32le.size(), 4));

    it('should encode', function() {
      assert.deepEqual(fixed32le.toBuffer(250.55), new Uint8Array([0xcc, 0x8c, 0xfa, 0x00]));
    });
  });
});
