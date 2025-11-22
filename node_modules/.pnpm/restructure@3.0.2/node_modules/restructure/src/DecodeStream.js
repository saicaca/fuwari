// Node back-compat.
const ENCODING_MAPPING = {
  utf16le: 'utf-16le',
  ucs2: 'utf-16le',
  utf16be: 'utf-16be'
}

export class DecodeStream {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    this.pos = 0;
    this.length = this.buffer.length;
  }

  readString(length, encoding = 'ascii') {
    encoding = ENCODING_MAPPING[encoding] || encoding;

    let buf = this.readBuffer(length);
    try {
      let decoder = new TextDecoder(encoding);
      return decoder.decode(buf);
    } catch (err) {
      return buf;
    }
  }

  readBuffer(length) {
    return this.buffer.slice(this.pos, (this.pos += length));
  }

  readUInt24BE() {
    return (this.readUInt16BE() << 8) + this.readUInt8();
  }

  readUInt24LE() {
    return this.readUInt16LE() + (this.readUInt8() << 16);
  }

  readInt24BE() {
    return (this.readInt16BE() << 8) + this.readUInt8();
  }

  readInt24LE() {
    return this.readUInt16LE() + (this.readInt8() << 16);
  }
}

DecodeStream.TYPES = {
  UInt8: 1,
  UInt16: 2,
  UInt24: 3,
  UInt32: 4,
  Int8: 1,
  Int16: 2,
  Int24: 3,
  Int32: 4,
  Float: 4,
  Double: 8
};

for (let key of Object.getOwnPropertyNames(DataView.prototype)) {
  if (key.slice(0, 3) === 'get') {
    let type = key.slice(3).replace('Ui', 'UI');
    if (type === 'Float32') {
      type = 'Float';
    } else if (type === 'Float64') {
      type = 'Double';
    }
    let bytes = DecodeStream.TYPES[type];
    DecodeStream.prototype['read' + type + (bytes === 1 ? '' : 'BE')] = function () {
      const ret = this.view[key](this.pos, false);
      this.pos += bytes;
      return ret;
    };

    if (bytes !== 1) {
      DecodeStream.prototype['read' + type + 'LE'] = function () {
        const ret = this.view[key](this.pos, true);
        this.pos += bytes;
        return ret;
      };
    }
  }
}
