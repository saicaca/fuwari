import assert from 'assert';
import {Bitfield, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Bitfield', function() {
  const bitfield = new Bitfield(uint8, ['Jack', 'Kack', 'Lack', 'Mack', 'Nack', 'Oack', 'Pack', 'Quack']);
  const JACK  = 1 << 0;
  const KACK  = 1 << 1;
  const LACK  = 1 << 2;
  const MACK  = 1 << 3;
  const NACK  = 1 << 4;
  const OACK  = 1 << 5;
  const PACK  = 1 << 6;
  const QUACK = 1 << 7;

  it('should have the right size', () => assert.equal(bitfield.size(), 1));

  it('should decode', function() {
    const buffer = new Uint8Array([JACK | MACK | PACK | NACK | QUACK]);
    assert.deepEqual(
      bitfield.fromBuffer(buffer),
      {Jack: true, Kack: false, Lack: false, Mack: true, Nack: true, Oack: false, Pack: true, Quack: true}
    );
  });

  it('should encode', function() {
    let buffer = bitfield.toBuffer({Jack: true, Kack: false, Lack: false, Mack: true, Nack: true, Oack: false, Pack: true, Quack: true});
    assert.deepEqual(buffer, Buffer.from([JACK | MACK | PACK | NACK | QUACK]));
  });
});
