import {EncodeStream} from 'restructure';
import assert from 'assert';

describe('EncodeStream', function() {
  it('should write a buffer', function() {
    const stream = new EncodeStream(new Uint8Array(3));
    stream.writeBuffer(new Uint8Array([1,2,3]));
    assert.deepEqual(stream.buffer, new Uint8Array([1,2,3]));
  });

  it('should writeUInt16BE', function() {
    const stream = new EncodeStream(new Uint8Array(2));
    stream.writeUInt16BE(0xabcd);
    assert.deepEqual(stream.buffer, new Uint8Array([0xab, 0xcd]));
  });

  it('should writeUInt16LE', function() {
    const stream = new EncodeStream(new Uint8Array(2));
    stream.writeUInt16LE(0xcdab);
    assert.deepEqual(stream.buffer, new Uint8Array([0xab, 0xcd]));
  });

  it('should writeUInt24BE', function() {
    const stream = new EncodeStream(new Uint8Array(3));
    stream.writeUInt24BE(0xabcdef);
    assert.deepEqual(stream.buffer, new Uint8Array([0xab, 0xcd, 0xef]));
  });

  it('should writeUInt24LE', function() {
    const stream = new EncodeStream(new Uint8Array(3));
    stream.writeUInt24LE(0xabcdef);
    assert.deepEqual(stream.buffer, new Uint8Array([0xef, 0xcd, 0xab]));
  });

  it('should writeInt24BE', function() {
    const stream = new EncodeStream(new Uint8Array(6));
    stream.writeInt24BE(-21724);
    stream.writeInt24BE(0xabcdef);
    assert.deepEqual(stream.buffer, new Uint8Array([0xff, 0xab, 0x24, 0xab, 0xcd, 0xef]));
  });

  it('should writeInt24LE', function() {
    const stream = new EncodeStream(new Uint8Array(6));
    stream.writeInt24LE(-21724);
    stream.writeInt24LE(0xabcdef);
    assert.deepEqual(stream.buffer, new Uint8Array([0x24, 0xab, 0xff, 0xef, 0xcd, 0xab]));
  });

  it('should fill', function() {
    const stream = new EncodeStream(new Uint8Array(5));
    stream.fill(10, 5);
    assert.deepEqual(stream.buffer, new Uint8Array([10, 10, 10, 10, 10]));
  });

  describe('writeString', function() {
    it('should encode ascii by default', function() {
      const expected = Buffer.from('some text', 'ascii');
      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('some text');
      assert.deepEqual(stream.buffer, expected);
    });

    it('should encode ascii', function() {
      const expected = Buffer.from('some text', 'ascii');
      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('some text', 'ascii');
      assert.deepEqual(stream.buffer, expected);
    });

    it('should encode utf8', function() {
      const expected = Buffer.from('unicode! 👍', 'utf8');
      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('unicode! 👍', 'utf8');
      assert.deepEqual(stream.buffer, expected);
    });

    it('should encode utf16le', function() {
      const expected = Buffer.from('unicode! 👍', 'utf16le');
      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('unicode! 👍', 'utf16le');
      assert.deepEqual(stream.buffer, expected);
    });

    it('should encode ucs2', function() {
      const expected = Buffer.from('unicode! 👍', 'ucs2');
      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('unicode! 👍', 'ucs2');
      assert.deepEqual(stream.buffer, expected);
    });

    it('should encode utf16be', function() {
      const expected = Buffer.from('unicode! 👍', 'utf16le');
      for (let i = 0, end = expected.length - 1; i < end; i += 2) {
        const byte = expected[i];
        expected[i] = expected[i + 1];
        expected[i + 1] = byte;
      }

      const stream = new EncodeStream(new Uint8Array(expected.length));
      stream.writeString('unicode! 👍', 'utf16be');
      assert.deepEqual(stream.buffer, expected);
    });
  });
});
