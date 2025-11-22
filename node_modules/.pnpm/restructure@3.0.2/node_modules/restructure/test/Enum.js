import assert from 'assert';
import {Enum, uint8, DecodeStream, EncodeStream} from 'restructure';

describe('Enum', function() {
  const e = new Enum(uint8, ['foo', 'bar', 'baz']);
  it('should have the right size', () => assert.equal(e.size(), 1));

  it('should decode', function() {
    const stream = new DecodeStream(new Uint8Array([1, 2, 0]));
    assert.equal(e.decode(stream), 'bar');
    assert.equal(e.decode(stream), 'baz');
    assert.equal(e.decode(stream), 'foo');
  });

  it('should encode', function() {
    assert.deepEqual(e.toBuffer('bar'), new Uint8Array([1]));
    assert.deepEqual(e.toBuffer('baz'), new Uint8Array([2]));
    assert.deepEqual(e.toBuffer('foo'), new Uint8Array([0]));
  });

  it('should throw on unknown option', function() {
    return assert.throws(() => e.toBuffer('unknown'));
  });
});
