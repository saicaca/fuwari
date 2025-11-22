import {DecodeStream} from './DecodeStream.js';

const textEncoder = new TextEncoder();
const isBigEndian = new Uint8Array(new Uint16Array([0x1234]).buffer)[0] == 0x12;

export class EncodeStream {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    this.pos = 0;
  }

  writeBuffer(buffer) {
    this.buffer.set(buffer, this.pos);
    this.pos += buffer.length;
  }

  writeString(string, encoding = 'ascii') {
    let buf;
    switch (encoding) {
      case 'utf16le':
      case 'utf16-le':
      case 'ucs2': // node treats this the same as utf16.
        buf = stringToUtf16(string, isBigEndian);
        break;

      case 'utf16be':
      case 'utf16-be':
        buf = stringToUtf16(string, !isBigEndian);
        break;

      case 'utf8':
        buf = textEncoder.encode(string);
        break;

      case 'ascii':
        buf = stringToAscii(string);
        break;

      default:
        throw new Error(`Unsupported encoding: ${encoding}`);
    }

    this.writeBuffer(buf);
  }

  writeUInt24BE(val) {
    this.buffer[this.pos++] = (val >>> 16) & 0xff;
    this.buffer[this.pos++] = (val >>> 8) & 0xff;
    this.buffer[this.pos++] = val & 0xff;
  }

  writeUInt24LE(val) {
    this.buffer[this.pos++] = val & 0xff;
    this.buffer[this.pos++] = (val >>> 8) & 0xff;
    this.buffer[this.pos++] = (val >>> 16) & 0xff;
  }

  writeInt24BE(val) {
    if (val >= 0) {
      this.writeUInt24BE(val);
    } else {
      this.writeUInt24BE(val + 0xffffff + 1);
    }
  }

  writeInt24LE(val) {
    if (val >= 0) {
      this.writeUInt24LE(val);
    } else {
      this.writeUInt24LE(val + 0xffffff + 1);
    }
  }

  fill(val, length) {
    if (length < this.buffer.length) {
      this.buffer.fill(val, this.pos, this.pos + length);
      this.pos += length;
    } else {
      const buf = new Uint8Array(length);
      buf.fill(val);
      this.writeBuffer(buf);
    }
  }
}

function stringToUtf16(string, swap) {
  let buf = new Uint16Array(string.length);
  for (let i = 0; i < string.length; i++) {
    let code = string.charCodeAt(i);
    if (swap) {
      code = (code >> 8) | ((code & 0xff) << 8);
    }
    buf[i] = code;
  }
  return new Uint8Array(buf.buffer);
}

function stringToAscii(string) {
  let buf = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    // Match node.js behavior - encoding allows 8-bit rather than 7-bit.
    buf[i] = string.charCodeAt(i);
  }
  return buf;
}

for (let key of Object.getOwnPropertyNames(DataView.prototype)) {
  if (key.slice(0, 3) === 'set') {
    let type = key.slice(3).replace('Ui', 'UI');
    if (type === 'Float32') {
      type = 'Float';
    } else if (type === 'Float64') {
      type = 'Double';
    }
    let bytes = DecodeStream.TYPES[type];
    EncodeStream.prototype['write' + type + (bytes === 1 ? '' : 'BE')] = function (value) {
      this.view[key](this.pos, value, false);
      this.pos += bytes;
    };

    if (bytes !== 1) {
      EncodeStream.prototype['write' + type + 'LE'] = function (value) {
        this.view[key](this.pos, value, true);
        this.pos += bytes;
      };
    }
  }
}
