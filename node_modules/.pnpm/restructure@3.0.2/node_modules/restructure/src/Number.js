import {DecodeStream} from './DecodeStream.js';
import {Base} from './Base.js';

class NumberT extends Base {
  constructor(type, endian = 'BE') {
    super();
    this.type = type;
    this.endian = endian;
    this.fn = this.type;
    if (this.type[this.type.length - 1] !== '8') {
      this.fn += this.endian;
    }
  }

  size() {
    return DecodeStream.TYPES[this.type];
  }

  decode(stream) {
    return stream[`read${this.fn}`]();
  }

  encode(stream, val) {
    return stream[`write${this.fn}`](val);
  }
}

export {NumberT as Number};

export const uint8 = new NumberT('UInt8');
export const uint16be = new NumberT('UInt16', 'BE');
export const uint16 = uint16be;
export const uint16le = new NumberT('UInt16', 'LE');
export const uint24be = new NumberT('UInt24', 'BE');
export const uint24 = uint24be;
export const uint24le = new NumberT('UInt24', 'LE');
export const uint32be = new NumberT('UInt32', 'BE');
export const uint32 = uint32be;
export const uint32le = new NumberT('UInt32', 'LE');
export const int8 = new NumberT('Int8');
export const int16be = new NumberT('Int16', 'BE');
export const int16 = int16be;
export const int16le = new NumberT('Int16', 'LE');
export const int24be = new NumberT('Int24', 'BE');
export const int24 = int24be;
export const int24le = new NumberT('Int24', 'LE');
export const int32be = new NumberT('Int32', 'BE');
export const int32 = int32be;
export const int32le = new NumberT('Int32', 'LE');
export const floatbe = new NumberT('Float', 'BE');
export const float = floatbe;
export const floatle = new NumberT('Float', 'LE');
export const doublebe = new NumberT('Double', 'BE');
export const double = doublebe;
export const doublele = new NumberT('Double', 'LE');

export class Fixed extends NumberT {
  constructor(size, endian, fracBits = size >> 1) {
    super(`Int${size}`, endian);
    this._point = 1 << fracBits;
  }

  decode(stream) {
    return super.decode(stream) / this._point;
  }

  encode(stream, val) {
    return super.encode(stream, (val * this._point) | 0);
  }
}

export const fixed16be = new Fixed(16, 'BE');
export const fixed16 = fixed16be;
export const fixed16le = new Fixed(16, 'LE');
export const fixed32be = new Fixed(32, 'BE');
export const fixed32 = fixed32be;
export const fixed32le = new Fixed(32, 'LE');
