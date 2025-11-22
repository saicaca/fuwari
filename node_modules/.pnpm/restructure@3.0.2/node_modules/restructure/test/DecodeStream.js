import {DecodeStream} from 'restructure';
import assert from 'assert';

describe('DecodeStream', function() {
  it('should read a buffer', function() {
    const buf = new Uint8Array([1,2,3]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readBuffer(buf.length), new Uint8Array([1,2,3]));
  });

  it('should readUInt16BE', function() {
    const buf = new Uint8Array([0xab, 0xcd]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readUInt16BE(), 0xabcd);
  });

  it('should readUInt16LE', function() {
    const buf = new Uint8Array([0xab, 0xcd]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readUInt16LE(), 0xcdab);
  });

  it('should readUInt24BE', function() {
    const buf = new Uint8Array([0xab, 0xcd, 0xef]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readUInt24BE(), 0xabcdef);
  });

  it('should readUInt24LE', function() {
    const buf = new Uint8Array([0xab, 0xcd, 0xef]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readUInt24LE(), 0xefcdab);
  });

  it('should readInt24BE', function() {
    const buf = new Uint8Array([0xff, 0xab, 0x24]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readInt24BE(), -21724);
  });

  it('should readInt24LE', function() {
    const buf = new Uint8Array([0x24, 0xab, 0xff]);
    const stream = new DecodeStream(buf);
    assert.deepEqual(stream.readInt24LE(), -21724);
  });

  describe('readString', function() {
    it('should decode ascii by default', function() {
      const buf = Buffer.from('some text', 'ascii');
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length), 'some text');
    });

    it('should decode ascii', function() {
      const buf = Buffer.from('some text', 'ascii');
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'ascii'), 'some text');
    });

    it('should decode utf8', function() {
      const buf = Buffer.from('unicode! 👍', 'utf8');
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'utf8'), 'unicode! 👍');
    });

    it('should decode utf16le', function() {
      const buf = Buffer.from('unicode! 👍', 'utf16le');
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'utf16le'), 'unicode! 👍');
    });

    it('should decode ucs2', function() {
      const buf = Buffer.from('unicode! 👍', 'ucs2');
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'ucs2'), 'unicode! 👍');
    });

    it('should decode utf16be', function() {
      const buf = Buffer.from('unicode! 👍', 'utf16le');
      for (let i = 0, end = buf.length - 1; i < end; i += 2) {
        const byte = buf[i];
        buf[i] = buf[i + 1];
        buf[i + 1] = byte;
      }

      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'utf16be'), 'unicode! 👍');
    });

    it('should decode macroman', function() {
      const buf = new Uint8Array([0x8a, 0x63, 0x63, 0x65, 0x6e, 0x74, 0x65, 0x64, 0x20, 0x63, 0x68, 0x87, 0x72, 0x61, 0x63, 0x74, 0x65, 0x72, 0x73]);
      const stream = new DecodeStream(buf);
      assert.equal(stream.readString(buf.length, 'mac'), 'äccented cháracters');
    });

    it('should return a buffer for unsupported encodings', function() {
      const stream = new DecodeStream(new Uint8Array([1, 2, 3]));
      assert.deepEqual(stream.readString(3, 'unsupported'), new Uint8Array([1, 2, 3]));
  });
});
});
