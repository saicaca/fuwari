import assert from 'assert';
import {Reserved, uint8, uint16, DecodeStream, EncodeStream} from 'restructure';

describe('Reserved', function() {
  it('should have a default count of 1', function() {
    const reserved = new Reserved(uint8);
    assert.equal(reserved.size(), 1);
  });

  it('should allow custom counts and types', function() {
    const reserved = new Reserved(uint16, 10);
    assert.equal(reserved.size(), 20);
  });

  it('should decode', function() {
    const stream = new DecodeStream(new Uint8Array([0, 0]));
    const reserved = new Reserved(uint16);
    assert.equal(reserved.decode(stream), null);
    assert.equal(stream.pos, 2);
  });

  it('should encode', function() {
    const reserved = new Reserved(uint16);
    assert.deepEqual(reserved.toBuffer(), new Uint8Array([0, 0]));
  });
});
