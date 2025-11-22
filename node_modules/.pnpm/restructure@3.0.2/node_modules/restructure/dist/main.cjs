
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) {
      return;
    }

    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });

  return dest;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "EncodeStream", () => $1ed46182c1410e1d$export$9b4f661deaa36c3e);
$parcel$export(module.exports, "DecodeStream", () => $8ae20583b93e4933$export$c18b354bac7948e9);
$parcel$export(module.exports, "Array", () => $8ea28a08eae2a116$export$c4be6576ca6fe4aa);
$parcel$export(module.exports, "LazyArray", () => $444f112d3cbc7e9f$export$5576c026028d4983);
$parcel$export(module.exports, "Bitfield", () => $3def237a34a226b5$export$96b43b8a49f688ea);
$parcel$export(module.exports, "Boolean", () => $8415e91bb83faf74$export$ff887cefee4d61ec);
$parcel$export(module.exports, "Buffer", () => $08d28604119af47e$export$7d22a0eea6656474);
$parcel$export(module.exports, "Enum", () => $070ce31ea947467f$export$deb82508dd66d288);
$parcel$export(module.exports, "Optional", () => $80703542fcfb6ff0$export$7acb7b24c478f9c6);
$parcel$export(module.exports, "Reserved", () => $f4fd49878232508a$export$da9b5fe187a9aa1);
$parcel$export(module.exports, "String", () => $d8705cd4022e7dcf$export$89b8e0fa65f6a914);
$parcel$export(module.exports, "Struct", () => $aa8b66bae6abe658$export$eabc71f011df675a);
$parcel$export(module.exports, "VersionedStruct", () => $fcb208a95f6d048b$export$95a8b60f4da7dec8);
// Node back-compat.
const $8ae20583b93e4933$var$ENCODING_MAPPING = {
    utf16le: "utf-16le",
    ucs2: "utf-16le",
    utf16be: "utf-16be"
};
class $8ae20583b93e4933$export$c18b354bac7948e9 {
    constructor(buffer){
        this.buffer = buffer;
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.pos = 0;
        this.length = this.buffer.length;
    }
    readString(length, encoding = "ascii") {
        encoding = $8ae20583b93e4933$var$ENCODING_MAPPING[encoding] || encoding;
        let buf = this.readBuffer(length);
        try {
            let decoder = new TextDecoder(encoding);
            return decoder.decode(buf);
        } catch (err) {
            return buf;
        }
    }
    readBuffer(length) {
        return this.buffer.slice(this.pos, this.pos += length);
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
$8ae20583b93e4933$export$c18b354bac7948e9.TYPES = {
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
for (let key of Object.getOwnPropertyNames(DataView.prototype))if (key.slice(0, 3) === "get") {
    let type = key.slice(3).replace("Ui", "UI");
    if (type === "Float32") type = "Float";
    else if (type === "Float64") type = "Double";
    let bytes = $8ae20583b93e4933$export$c18b354bac7948e9.TYPES[type];
    $8ae20583b93e4933$export$c18b354bac7948e9.prototype["read" + type + (bytes === 1 ? "" : "BE")] = function() {
        const ret = this.view[key](this.pos, false);
        this.pos += bytes;
        return ret;
    };
    if (bytes !== 1) $8ae20583b93e4933$export$c18b354bac7948e9.prototype["read" + type + "LE"] = function() {
        const ret = this.view[key](this.pos, true);
        this.pos += bytes;
        return ret;
    };
}


const $1ed46182c1410e1d$var$textEncoder = new TextEncoder();
const $1ed46182c1410e1d$var$isBigEndian = new Uint8Array(new Uint16Array([
    0x1234
]).buffer)[0] == 0x12;
class $1ed46182c1410e1d$export$9b4f661deaa36c3e {
    constructor(buffer){
        this.buffer = buffer;
        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
        this.pos = 0;
    }
    writeBuffer(buffer) {
        this.buffer.set(buffer, this.pos);
        this.pos += buffer.length;
    }
    writeString(string, encoding = "ascii") {
        let buf;
        switch(encoding){
            case "utf16le":
            case "utf16-le":
            case "ucs2":
                buf = $1ed46182c1410e1d$var$stringToUtf16(string, $1ed46182c1410e1d$var$isBigEndian);
                break;
            case "utf16be":
            case "utf16-be":
                buf = $1ed46182c1410e1d$var$stringToUtf16(string, !$1ed46182c1410e1d$var$isBigEndian);
                break;
            case "utf8":
                buf = $1ed46182c1410e1d$var$textEncoder.encode(string);
                break;
            case "ascii":
                buf = $1ed46182c1410e1d$var$stringToAscii(string);
                break;
            default:
                throw new Error(`Unsupported encoding: ${encoding}`);
        }
        this.writeBuffer(buf);
    }
    writeUInt24BE(val) {
        this.buffer[this.pos++] = val >>> 16 & 0xff;
        this.buffer[this.pos++] = val >>> 8 & 0xff;
        this.buffer[this.pos++] = val & 0xff;
    }
    writeUInt24LE(val) {
        this.buffer[this.pos++] = val & 0xff;
        this.buffer[this.pos++] = val >>> 8 & 0xff;
        this.buffer[this.pos++] = val >>> 16 & 0xff;
    }
    writeInt24BE(val) {
        if (val >= 0) this.writeUInt24BE(val);
        else this.writeUInt24BE(val + 0xffffff + 1);
    }
    writeInt24LE(val) {
        if (val >= 0) this.writeUInt24LE(val);
        else this.writeUInt24LE(val + 0xffffff + 1);
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
function $1ed46182c1410e1d$var$stringToUtf16(string, swap) {
    let buf = new Uint16Array(string.length);
    for(let i = 0; i < string.length; i++){
        let code = string.charCodeAt(i);
        if (swap) code = code >> 8 | (code & 0xff) << 8;
        buf[i] = code;
    }
    return new Uint8Array(buf.buffer);
}
function $1ed46182c1410e1d$var$stringToAscii(string) {
    let buf = new Uint8Array(string.length);
    for(let i = 0; i < string.length; i++)// Match node.js behavior - encoding allows 8-bit rather than 7-bit.
    buf[i] = string.charCodeAt(i);
    return buf;
}
for (let key of Object.getOwnPropertyNames(DataView.prototype))if (key.slice(0, 3) === "set") {
    let type = key.slice(3).replace("Ui", "UI");
    if (type === "Float32") type = "Float";
    else if (type === "Float64") type = "Double";
    let bytes = (0, $8ae20583b93e4933$export$c18b354bac7948e9).TYPES[type];
    $1ed46182c1410e1d$export$9b4f661deaa36c3e.prototype["write" + type + (bytes === 1 ? "" : "BE")] = function(value) {
        this.view[key](this.pos, value, false);
        this.pos += bytes;
    };
    if (bytes !== 1) $1ed46182c1410e1d$export$9b4f661deaa36c3e.prototype["write" + type + "LE"] = function(value) {
        this.view[key](this.pos, value, true);
        this.pos += bytes;
    };
}





class $8d21f7fa58802901$export$ef88aa0d34c34520 {
    fromBuffer(buffer) {
        let stream = new (0, $8ae20583b93e4933$export$c18b354bac7948e9)(buffer);
        return this.decode(stream);
    }
    toBuffer(value) {
        let size = this.size(value);
        let buffer = new Uint8Array(size);
        let stream = new (0, $1ed46182c1410e1d$export$9b4f661deaa36c3e)(buffer);
        this.encode(stream, value);
        return buffer;
    }
}


var $af65abf7bf65ac42$exports = {};

$parcel$export($af65abf7bf65ac42$exports, "Number", () => $af65abf7bf65ac42$export$fffa67e515d04022);
$parcel$export($af65abf7bf65ac42$exports, "uint8", () => $af65abf7bf65ac42$export$52e103c63c4e68cf);
$parcel$export($af65abf7bf65ac42$exports, "uint16be", () => $af65abf7bf65ac42$export$60dfe43c8297a8f8);
$parcel$export($af65abf7bf65ac42$exports, "uint16", () => $af65abf7bf65ac42$export$56bd24b5a3ee8456);
$parcel$export($af65abf7bf65ac42$exports, "uint16le", () => $af65abf7bf65ac42$export$b92d76f0ca6d1789);
$parcel$export($af65abf7bf65ac42$exports, "uint24be", () => $af65abf7bf65ac42$export$255f45171f96b50c);
$parcel$export($af65abf7bf65ac42$exports, "uint24", () => $af65abf7bf65ac42$export$1925298fbd719b21);
$parcel$export($af65abf7bf65ac42$exports, "uint24le", () => $af65abf7bf65ac42$export$758e1dafc8dc7271);
$parcel$export($af65abf7bf65ac42$exports, "uint32be", () => $af65abf7bf65ac42$export$74c16dba6c885532);
$parcel$export($af65abf7bf65ac42$exports, "uint32", () => $af65abf7bf65ac42$export$de9ffb9418dd7d0d);
$parcel$export($af65abf7bf65ac42$exports, "uint32le", () => $af65abf7bf65ac42$export$5f744bb30a534bc9);
$parcel$export($af65abf7bf65ac42$exports, "int8", () => $af65abf7bf65ac42$export$5984f25eab09961f);
$parcel$export($af65abf7bf65ac42$exports, "int16be", () => $af65abf7bf65ac42$export$198ae7d10d26a900);
$parcel$export($af65abf7bf65ac42$exports, "int16", () => $af65abf7bf65ac42$export$c35c15c7caeff2b6);
$parcel$export($af65abf7bf65ac42$exports, "int16le", () => $af65abf7bf65ac42$export$399cc4b7169e5aed);
$parcel$export($af65abf7bf65ac42$exports, "int24be", () => $af65abf7bf65ac42$export$3676d1f71eca2ec0);
$parcel$export($af65abf7bf65ac42$exports, "int24", () => $af65abf7bf65ac42$export$73f695d681ac61f9);
$parcel$export($af65abf7bf65ac42$exports, "int24le", () => $af65abf7bf65ac42$export$671f8672dbd40a4);
$parcel$export($af65abf7bf65ac42$exports, "int32be", () => $af65abf7bf65ac42$export$78a2ac3d09dd42d5);
$parcel$export($af65abf7bf65ac42$exports, "int32", () => $af65abf7bf65ac42$export$1d95835383bb05a);
$parcel$export($af65abf7bf65ac42$exports, "int32le", () => $af65abf7bf65ac42$export$5ec1f146e759329a);
$parcel$export($af65abf7bf65ac42$exports, "floatbe", () => $af65abf7bf65ac42$export$92b5c14c6abb5c97);
$parcel$export($af65abf7bf65ac42$exports, "float", () => $af65abf7bf65ac42$export$6b5cd3983e3ee5ab);
$parcel$export($af65abf7bf65ac42$exports, "floatle", () => $af65abf7bf65ac42$export$6d20592bc4cb19d9);
$parcel$export($af65abf7bf65ac42$exports, "doublebe", () => $af65abf7bf65ac42$export$e50b9e97e4d43631);
$parcel$export($af65abf7bf65ac42$exports, "double", () => $af65abf7bf65ac42$export$7b3cbda67be88f5f);
$parcel$export($af65abf7bf65ac42$exports, "doublele", () => $af65abf7bf65ac42$export$6f53315aa512b751);
$parcel$export($af65abf7bf65ac42$exports, "Fixed", () => $af65abf7bf65ac42$export$13475bbd2a37a9b4);
$parcel$export($af65abf7bf65ac42$exports, "fixed16be", () => $af65abf7bf65ac42$export$f87b441e6bd90278);
$parcel$export($af65abf7bf65ac42$exports, "fixed16", () => $af65abf7bf65ac42$export$a3abada75ef55921);
$parcel$export($af65abf7bf65ac42$exports, "fixed16le", () => $af65abf7bf65ac42$export$3752a2886837dc22);
$parcel$export($af65abf7bf65ac42$exports, "fixed32be", () => $af65abf7bf65ac42$export$dd71d8d9bc792632);
$parcel$export($af65abf7bf65ac42$exports, "fixed32", () => $af65abf7bf65ac42$export$e913265d48471f2d);
$parcel$export($af65abf7bf65ac42$exports, "fixed32le", () => $af65abf7bf65ac42$export$7fc47db6a5fc8223);


class $af65abf7bf65ac42$export$fffa67e515d04022 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, endian = "BE"){
        super();
        this.type = type;
        this.endian = endian;
        this.fn = this.type;
        if (this.type[this.type.length - 1] !== "8") this.fn += this.endian;
    }
    size() {
        return (0, $8ae20583b93e4933$export$c18b354bac7948e9).TYPES[this.type];
    }
    decode(stream) {
        return stream[`read${this.fn}`]();
    }
    encode(stream, val) {
        return stream[`write${this.fn}`](val);
    }
}
const $af65abf7bf65ac42$export$52e103c63c4e68cf = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt8");
const $af65abf7bf65ac42$export$60dfe43c8297a8f8 = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt16", "BE");
const $af65abf7bf65ac42$export$56bd24b5a3ee8456 = $af65abf7bf65ac42$export$60dfe43c8297a8f8;
const $af65abf7bf65ac42$export$b92d76f0ca6d1789 = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt16", "LE");
const $af65abf7bf65ac42$export$255f45171f96b50c = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt24", "BE");
const $af65abf7bf65ac42$export$1925298fbd719b21 = $af65abf7bf65ac42$export$255f45171f96b50c;
const $af65abf7bf65ac42$export$758e1dafc8dc7271 = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt24", "LE");
const $af65abf7bf65ac42$export$74c16dba6c885532 = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt32", "BE");
const $af65abf7bf65ac42$export$de9ffb9418dd7d0d = $af65abf7bf65ac42$export$74c16dba6c885532;
const $af65abf7bf65ac42$export$5f744bb30a534bc9 = new $af65abf7bf65ac42$export$fffa67e515d04022("UInt32", "LE");
const $af65abf7bf65ac42$export$5984f25eab09961f = new $af65abf7bf65ac42$export$fffa67e515d04022("Int8");
const $af65abf7bf65ac42$export$198ae7d10d26a900 = new $af65abf7bf65ac42$export$fffa67e515d04022("Int16", "BE");
const $af65abf7bf65ac42$export$c35c15c7caeff2b6 = $af65abf7bf65ac42$export$198ae7d10d26a900;
const $af65abf7bf65ac42$export$399cc4b7169e5aed = new $af65abf7bf65ac42$export$fffa67e515d04022("Int16", "LE");
const $af65abf7bf65ac42$export$3676d1f71eca2ec0 = new $af65abf7bf65ac42$export$fffa67e515d04022("Int24", "BE");
const $af65abf7bf65ac42$export$73f695d681ac61f9 = $af65abf7bf65ac42$export$3676d1f71eca2ec0;
const $af65abf7bf65ac42$export$671f8672dbd40a4 = new $af65abf7bf65ac42$export$fffa67e515d04022("Int24", "LE");
const $af65abf7bf65ac42$export$78a2ac3d09dd42d5 = new $af65abf7bf65ac42$export$fffa67e515d04022("Int32", "BE");
const $af65abf7bf65ac42$export$1d95835383bb05a = $af65abf7bf65ac42$export$78a2ac3d09dd42d5;
const $af65abf7bf65ac42$export$5ec1f146e759329a = new $af65abf7bf65ac42$export$fffa67e515d04022("Int32", "LE");
const $af65abf7bf65ac42$export$92b5c14c6abb5c97 = new $af65abf7bf65ac42$export$fffa67e515d04022("Float", "BE");
const $af65abf7bf65ac42$export$6b5cd3983e3ee5ab = $af65abf7bf65ac42$export$92b5c14c6abb5c97;
const $af65abf7bf65ac42$export$6d20592bc4cb19d9 = new $af65abf7bf65ac42$export$fffa67e515d04022("Float", "LE");
const $af65abf7bf65ac42$export$e50b9e97e4d43631 = new $af65abf7bf65ac42$export$fffa67e515d04022("Double", "BE");
const $af65abf7bf65ac42$export$7b3cbda67be88f5f = $af65abf7bf65ac42$export$e50b9e97e4d43631;
const $af65abf7bf65ac42$export$6f53315aa512b751 = new $af65abf7bf65ac42$export$fffa67e515d04022("Double", "LE");
class $af65abf7bf65ac42$export$13475bbd2a37a9b4 extends $af65abf7bf65ac42$export$fffa67e515d04022 {
    constructor(size, endian, fracBits = size >> 1){
        super(`Int${size}`, endian);
        this._point = 1 << fracBits;
    }
    decode(stream) {
        return super.decode(stream) / this._point;
    }
    encode(stream, val) {
        return super.encode(stream, val * this._point | 0);
    }
}
const $af65abf7bf65ac42$export$f87b441e6bd90278 = new $af65abf7bf65ac42$export$13475bbd2a37a9b4(16, "BE");
const $af65abf7bf65ac42$export$a3abada75ef55921 = $af65abf7bf65ac42$export$f87b441e6bd90278;
const $af65abf7bf65ac42$export$3752a2886837dc22 = new $af65abf7bf65ac42$export$13475bbd2a37a9b4(16, "LE");
const $af65abf7bf65ac42$export$dd71d8d9bc792632 = new $af65abf7bf65ac42$export$13475bbd2a37a9b4(32, "BE");
const $af65abf7bf65ac42$export$e913265d48471f2d = $af65abf7bf65ac42$export$dd71d8d9bc792632;
const $af65abf7bf65ac42$export$7fc47db6a5fc8223 = new $af65abf7bf65ac42$export$13475bbd2a37a9b4(32, "LE");


var $4559ecf940edc78d$exports = {};

$parcel$export($4559ecf940edc78d$exports, "resolveLength", () => $4559ecf940edc78d$export$83b6dc3503c1fda6);
$parcel$export($4559ecf940edc78d$exports, "PropertyDescriptor", () => $4559ecf940edc78d$export$41705b1d644e0f14);

function $4559ecf940edc78d$export$83b6dc3503c1fda6(length, stream, parent) {
    let res;
    if (typeof length === "number") res = length;
    else if (typeof length === "function") res = length.call(parent, parent);
    else if (parent && typeof length === "string") res = parent[length];
    else if (stream && length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) res = length.decode(stream);
    if (isNaN(res)) throw new Error("Not a fixed size");
    return res;
}
class $4559ecf940edc78d$export$41705b1d644e0f14 {
    constructor(opts = {}){
        this.enumerable = true;
        this.configurable = true;
        for(let key in opts){
            const val = opts[key];
            this[key] = val;
        }
    }
}


class $8ea28a08eae2a116$export$c4be6576ca6fe4aa extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, length, lengthType = "count"){
        super();
        this.type = type;
        this.length = length;
        this.lengthType = lengthType;
    }
    decode(stream, parent) {
        let length;
        const { pos: pos } = stream;
        const res = [];
        let ctx = parent;
        if (this.length != null) length = $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, stream, parent);
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) {
            // define hidden properties
            Object.defineProperties(res, {
                parent: {
                    value: parent
                },
                _startOffset: {
                    value: pos
                },
                _currentOffset: {
                    value: 0,
                    writable: true
                },
                _length: {
                    value: length
                }
            });
            ctx = res;
        }
        if (length == null || this.lengthType === "bytes") {
            const target = length != null ? stream.pos + length : (parent != null ? parent._length : undefined) ? parent._startOffset + parent._length : stream.length;
            while(stream.pos < target)res.push(this.type.decode(stream, ctx));
        } else for(let i = 0, end = length; i < end; i++)res.push(this.type.decode(stream, ctx));
        return res;
    }
    size(array, ctx, includePointers = true) {
        if (!array) return this.type.size(null, ctx) * $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, null, ctx);
        let size = 0;
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) {
            size += this.length.size();
            ctx = {
                parent: ctx,
                pointerSize: 0
            };
        }
        for (let item of array)size += this.type.size(item, ctx);
        if (ctx && includePointers && this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) size += ctx.pointerSize;
        return size;
    }
    encode(stream, array, parent) {
        let ctx = parent;
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) {
            ctx = {
                pointers: [],
                startOffset: stream.pos,
                parent: parent
            };
            ctx.pointerOffset = stream.pos + this.size(array, ctx, false);
            this.length.encode(stream, array.length);
        }
        for (let item of array)this.type.encode(stream, item, ctx);
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) {
            let i = 0;
            while(i < ctx.pointers.length){
                const ptr = ctx.pointers[i++];
                ptr.type.encode(stream, ptr.val, ptr.parent);
            }
        }
    }
}





class $444f112d3cbc7e9f$export$5576c026028d4983 extends (0, $8ea28a08eae2a116$export$c4be6576ca6fe4aa) {
    decode(stream, parent) {
        const { pos: pos } = stream;
        const length = $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, stream, parent);
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) parent = {
            parent: parent,
            _startOffset: pos,
            _currentOffset: 0,
            _length: length
        };
        const res = new $444f112d3cbc7e9f$var$LazyArrayValue(this.type, length, stream, parent);
        stream.pos += length * this.type.size(null, parent);
        return res;
    }
    size(val, ctx) {
        if (val instanceof $444f112d3cbc7e9f$var$LazyArrayValue) val = val.toArray();
        return super.size(val, ctx);
    }
    encode(stream, val, ctx) {
        if (val instanceof $444f112d3cbc7e9f$var$LazyArrayValue) val = val.toArray();
        return super.encode(stream, val, ctx);
    }
}
class $444f112d3cbc7e9f$var$LazyArrayValue {
    constructor(type, length, stream, ctx){
        this.type = type;
        this.length = length;
        this.stream = stream;
        this.ctx = ctx;
        this.base = this.stream.pos;
        this.items = [];
    }
    get(index) {
        if (index < 0 || index >= this.length) return undefined;
        if (this.items[index] == null) {
            const { pos: pos } = this.stream;
            this.stream.pos = this.base + this.type.size(null, this.ctx) * index;
            this.items[index] = this.type.decode(this.stream, this.ctx);
            this.stream.pos = pos;
        }
        return this.items[index];
    }
    toArray() {
        const result = [];
        for(let i = 0, end = this.length; i < end; i++)result.push(this.get(i));
        return result;
    }
}



class $3def237a34a226b5$export$96b43b8a49f688ea extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, flags = []){
        super();
        this.type = type;
        this.flags = flags;
    }
    decode(stream) {
        const val = this.type.decode(stream);
        const res = {};
        for(let i = 0; i < this.flags.length; i++){
            const flag = this.flags[i];
            if (flag != null) res[flag] = !!(val & 1 << i);
        }
        return res;
    }
    size() {
        return this.type.size();
    }
    encode(stream, keys) {
        let val = 0;
        for(let i = 0; i < this.flags.length; i++){
            const flag = this.flags[i];
            if (flag != null) {
                if (keys[flag]) val |= 1 << i;
            }
        }
        return this.type.encode(stream, val);
    }
}



class $8415e91bb83faf74$export$ff887cefee4d61ec extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type){
        super();
        this.type = type;
    }
    decode(stream, parent) {
        return !!this.type.decode(stream, parent);
    }
    size(val, parent) {
        return this.type.size(val, parent);
    }
    encode(stream, val, parent) {
        return this.type.encode(stream, +val, parent);
    }
}





class $08d28604119af47e$export$7d22a0eea6656474 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(length){
        super();
        this.length = length;
    }
    decode(stream, parent) {
        const length = $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, stream, parent);
        return stream.readBuffer(length);
    }
    size(val, parent) {
        if (!val) return $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, null, parent);
        let len = val.length;
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) len += this.length.size();
        return len;
    }
    encode(stream, buf, parent) {
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) this.length.encode(stream, buf.length);
        return stream.writeBuffer(buf);
    }
}



class $070ce31ea947467f$export$deb82508dd66d288 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, options = []){
        super();
        this.type = type;
        this.options = options;
    }
    decode(stream) {
        const index = this.type.decode(stream);
        return this.options[index] || index;
    }
    size() {
        return this.type.size();
    }
    encode(stream, val) {
        const index = this.options.indexOf(val);
        if (index === -1) throw new Error(`Unknown option in enum: ${val}`);
        return this.type.encode(stream, index);
    }
}



class $80703542fcfb6ff0$export$7acb7b24c478f9c6 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, condition = true){
        super();
        this.type = type;
        this.condition = condition;
    }
    decode(stream, parent) {
        let { condition: condition } = this;
        if (typeof condition === "function") condition = condition.call(parent, parent);
        if (condition) return this.type.decode(stream, parent);
    }
    size(val, parent) {
        let { condition: condition } = this;
        if (typeof condition === "function") condition = condition.call(parent, parent);
        if (condition) return this.type.size(val, parent);
        else return 0;
    }
    encode(stream, val, parent) {
        let { condition: condition } = this;
        if (typeof condition === "function") condition = condition.call(parent, parent);
        if (condition) return this.type.encode(stream, val, parent);
    }
}




class $f4fd49878232508a$export$da9b5fe187a9aa1 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(type, count = 1){
        super();
        this.type = type;
        this.count = count;
    }
    decode(stream, parent) {
        stream.pos += this.size(null, parent);
        return undefined;
    }
    size(data, parent) {
        const count = $4559ecf940edc78d$export$83b6dc3503c1fda6(this.count, null, parent);
        return this.type.size() * count;
    }
    encode(stream, val, parent) {
        return stream.fill(0, this.size(val, parent));
    }
}





class $d8705cd4022e7dcf$export$89b8e0fa65f6a914 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(length, encoding = "ascii"){
        super();
        this.length = length;
        this.encoding = encoding;
    }
    decode(stream, parent) {
        let length, pos;
        let { encoding: encoding } = this;
        if (typeof encoding === "function") encoding = encoding.call(parent, parent) || "ascii";
        let width = $d8705cd4022e7dcf$var$encodingWidth(encoding);
        if (this.length != null) length = $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, stream, parent);
        else {
            let buffer;
            ({ buffer: buffer, length: length, pos: pos } = stream);
            while(pos < length - width + 1 && (buffer[pos] !== 0x00 || width === 2 && buffer[pos + 1] !== 0x00))pos += width;
            length = pos - stream.pos;
        }
        const string = stream.readString(length, encoding);
        if (this.length == null && stream.pos < stream.length) stream.pos += width;
        return string;
    }
    size(val, parent) {
        // Use the defined value if no value was given
        if (val === undefined || val === null) return $4559ecf940edc78d$export$83b6dc3503c1fda6(this.length, null, parent);
        let { encoding: encoding } = this;
        if (typeof encoding === "function") encoding = encoding.call(parent != null ? parent.val : undefined, parent != null ? parent.val : undefined) || "ascii";
        if (encoding === "utf16be") encoding = "utf16le";
        let size = $d8705cd4022e7dcf$var$byteLength(val, encoding);
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) size += this.length.size();
        if (this.length == null) size += $d8705cd4022e7dcf$var$encodingWidth(encoding);
        return size;
    }
    encode(stream, val, parent) {
        let { encoding: encoding } = this;
        if (typeof encoding === "function") encoding = encoding.call(parent != null ? parent.val : undefined, parent != null ? parent.val : undefined) || "ascii";
        if (this.length instanceof (0, $af65abf7bf65ac42$export$fffa67e515d04022)) this.length.encode(stream, $d8705cd4022e7dcf$var$byteLength(val, encoding));
        stream.writeString(val, encoding);
        if (this.length == null) return $d8705cd4022e7dcf$var$encodingWidth(encoding) == 2 ? stream.writeUInt16LE(0x0000) : stream.writeUInt8(0x00);
    }
}
function $d8705cd4022e7dcf$var$encodingWidth(encoding) {
    switch(encoding){
        case "ascii":
        case "utf8":
            return 1;
        case "utf16le":
        case "utf16-le":
        case "utf-16be":
        case "utf-16le":
        case "utf16be":
        case "utf16-be":
        case "ucs2":
            return 2;
        default:
            //TODO: assume all other encodings are 1-byters
            //throw new Error('Unknown encoding ' + encoding);
            return 1;
    }
}
function $d8705cd4022e7dcf$var$byteLength(string, encoding) {
    switch(encoding){
        case "ascii":
            return string.length;
        case "utf8":
            let len = 0;
            for(let i = 0; i < string.length; i++){
                let c = string.charCodeAt(i);
                if (c >= 0xd800 && c <= 0xdbff && i < string.length - 1) {
                    let c2 = string.charCodeAt(++i);
                    if ((c2 & 0xfc00) === 0xdc00) c = ((c & 0x3ff) << 10) + (c2 & 0x3ff) + 0x10000;
                    else // unmatched surrogate.
                    i--;
                }
                if ((c & 0xffffff80) === 0) len++;
                else if ((c & 0xfffff800) === 0) len += 2;
                else if ((c & 0xffff0000) === 0) len += 3;
                else if ((c & 0xffe00000) === 0) len += 4;
            }
            return len;
        case "utf16le":
        case "utf16-le":
        case "utf16be":
        case "utf16-be":
        case "ucs2":
            return string.length * 2;
        default:
            throw new Error("Unknown encoding " + encoding);
    }
}




class $aa8b66bae6abe658$export$eabc71f011df675a extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(fields = {}){
        super();
        this.fields = fields;
    }
    decode(stream, parent, length = 0) {
        const res = this._setup(stream, parent, length);
        this._parseFields(stream, res, this.fields);
        if (this.process != null) this.process.call(res, stream);
        return res;
    }
    _setup(stream, parent, length) {
        const res = {};
        // define hidden properties
        Object.defineProperties(res, {
            parent: {
                value: parent
            },
            _startOffset: {
                value: stream.pos
            },
            _currentOffset: {
                value: 0,
                writable: true
            },
            _length: {
                value: length
            }
        });
        return res;
    }
    _parseFields(stream, res, fields) {
        for(let key in fields){
            var val;
            const type = fields[key];
            if (typeof type === "function") val = type.call(res, res);
            else val = type.decode(stream, res);
            if (val !== undefined) {
                if (val instanceof $4559ecf940edc78d$export$41705b1d644e0f14) Object.defineProperty(res, key, val);
                else res[key] = val;
            }
            res._currentOffset = stream.pos - res._startOffset;
        }
    }
    size(val, parent, includePointers = true) {
        if (val == null) val = {};
        const ctx = {
            parent: parent,
            val: val,
            pointerSize: 0
        };
        if (this.preEncode != null) this.preEncode.call(val);
        let size = 0;
        for(let key in this.fields){
            const type = this.fields[key];
            if (type.size != null) size += type.size(val[key], ctx);
        }
        if (includePointers) size += ctx.pointerSize;
        return size;
    }
    encode(stream, val, parent) {
        let type;
        if (this.preEncode != null) this.preEncode.call(val, stream);
        const ctx = {
            pointers: [],
            startOffset: stream.pos,
            parent: parent,
            val: val,
            pointerSize: 0
        };
        ctx.pointerOffset = stream.pos + this.size(val, ctx, false);
        for(let key in this.fields){
            type = this.fields[key];
            if (type.encode != null) type.encode(stream, val[key], ctx);
        }
        let i = 0;
        while(i < ctx.pointers.length){
            const ptr = ctx.pointers[i++];
            ptr.type.encode(stream, ptr.val, ptr.parent);
        }
    }
}



const $fcb208a95f6d048b$var$getPath = (object, pathArray)=>{
    return pathArray.reduce((prevObj, key)=>prevObj && prevObj[key], object);
};
class $fcb208a95f6d048b$export$95a8b60f4da7dec8 extends (0, $aa8b66bae6abe658$export$eabc71f011df675a) {
    constructor(type, versions = {}){
        super();
        this.type = type;
        this.versions = versions;
        if (typeof type === "string") this.versionPath = type.split(".");
    }
    decode(stream, parent, length = 0) {
        const res = this._setup(stream, parent, length);
        if (typeof this.type === "string") res.version = $fcb208a95f6d048b$var$getPath(parent, this.versionPath);
        else res.version = this.type.decode(stream);
        if (this.versions.header) this._parseFields(stream, res, this.versions.header);
        const fields = this.versions[res.version];
        if (fields == null) throw new Error(`Unknown version ${res.version}`);
        if (fields instanceof $fcb208a95f6d048b$export$95a8b60f4da7dec8) return fields.decode(stream, parent);
        this._parseFields(stream, res, fields);
        if (this.process != null) this.process.call(res, stream);
        return res;
    }
    size(val, parent, includePointers = true) {
        let key, type;
        if (!val) throw new Error("Not a fixed size");
        if (this.preEncode != null) this.preEncode.call(val);
        const ctx = {
            parent: parent,
            val: val,
            pointerSize: 0
        };
        let size = 0;
        if (typeof this.type !== "string") size += this.type.size(val.version, ctx);
        if (this.versions.header) for(key in this.versions.header){
            type = this.versions.header[key];
            if (type.size != null) size += type.size(val[key], ctx);
        }
        const fields = this.versions[val.version];
        if (fields == null) throw new Error(`Unknown version ${val.version}`);
        for(key in fields){
            type = fields[key];
            if (type.size != null) size += type.size(val[key], ctx);
        }
        if (includePointers) size += ctx.pointerSize;
        return size;
    }
    encode(stream, val, parent) {
        let key, type;
        if (this.preEncode != null) this.preEncode.call(val, stream);
        const ctx = {
            pointers: [],
            startOffset: stream.pos,
            parent: parent,
            val: val,
            pointerSize: 0
        };
        ctx.pointerOffset = stream.pos + this.size(val, ctx, false);
        if (typeof this.type !== "string") this.type.encode(stream, val.version);
        if (this.versions.header) for(key in this.versions.header){
            type = this.versions.header[key];
            if (type.encode != null) type.encode(stream, val[key], ctx);
        }
        const fields = this.versions[val.version];
        for(key in fields){
            type = fields[key];
            if (type.encode != null) type.encode(stream, val[key], ctx);
        }
        let i = 0;
        while(i < ctx.pointers.length){
            const ptr = ctx.pointers[i++];
            ptr.type.encode(stream, ptr.val, ptr.parent);
        }
    }
}




var $92184962f8f0d5e2$exports = {};

$parcel$export($92184962f8f0d5e2$exports, "Pointer", () => $92184962f8f0d5e2$export$b56007f12edf0c17);
$parcel$export($92184962f8f0d5e2$exports, "VoidPointer", () => $92184962f8f0d5e2$export$df5cb1f3d04f5a0f);


class $92184962f8f0d5e2$export$b56007f12edf0c17 extends (0, $8d21f7fa58802901$export$ef88aa0d34c34520) {
    constructor(offsetType, type, options = {}){
        super();
        this.offsetType = offsetType;
        this.type = type;
        this.options = options;
        if (this.type === "void") this.type = null;
        if (this.options.type == null) this.options.type = "local";
        if (this.options.allowNull == null) this.options.allowNull = true;
        if (this.options.nullValue == null) this.options.nullValue = 0;
        if (this.options.lazy == null) this.options.lazy = false;
        if (this.options.relativeTo) {
            if (typeof this.options.relativeTo !== "function") throw new Error("relativeTo option must be a function");
            this.relativeToGetter = options.relativeTo;
        }
    }
    decode(stream, ctx) {
        const offset = this.offsetType.decode(stream, ctx);
        // handle NULL pointers
        if (offset === this.options.nullValue && this.options.allowNull) return null;
        let relative;
        switch(this.options.type){
            case "local":
                relative = ctx._startOffset;
                break;
            case "immediate":
                relative = stream.pos - this.offsetType.size();
                break;
            case "parent":
                relative = ctx.parent._startOffset;
                break;
            default:
                var c = ctx;
                while(c.parent)c = c.parent;
                relative = c._startOffset || 0;
        }
        if (this.options.relativeTo) relative += this.relativeToGetter(ctx);
        const ptr = offset + relative;
        if (this.type != null) {
            let val = null;
            const decodeValue = ()=>{
                if (val != null) return val;
                const { pos: pos } = stream;
                stream.pos = ptr;
                val = this.type.decode(stream, ctx);
                stream.pos = pos;
                return val;
            };
            // If this is a lazy pointer, define a getter to decode only when needed.
            // This obviously only works when the pointer is contained by a Struct.
            if (this.options.lazy) return new $4559ecf940edc78d$export$41705b1d644e0f14({
                get: decodeValue
            });
            return decodeValue();
        } else return ptr;
    }
    size(val, ctx) {
        const parent = ctx;
        switch(this.options.type){
            case "local":
            case "immediate":
                break;
            case "parent":
                ctx = ctx.parent;
                break;
            default:
                while(ctx.parent)ctx = ctx.parent;
        }
        let { type: type } = this;
        if (type == null) {
            if (!(val instanceof $92184962f8f0d5e2$export$df5cb1f3d04f5a0f)) throw new Error("Must be a VoidPointer");
            ({ type: type } = val);
            val = val.value;
        }
        if (val && ctx) {
            // Must be written as two separate lines rather than += in case `type.size` mutates ctx.pointerSize.
            let size = type.size(val, parent);
            ctx.pointerSize += size;
        }
        return this.offsetType.size();
    }
    encode(stream, val, ctx) {
        let relative;
        const parent = ctx;
        if (val == null) {
            this.offsetType.encode(stream, this.options.nullValue);
            return;
        }
        switch(this.options.type){
            case "local":
                relative = ctx.startOffset;
                break;
            case "immediate":
                relative = stream.pos + this.offsetType.size(val, parent);
                break;
            case "parent":
                ctx = ctx.parent;
                relative = ctx.startOffset;
                break;
            default:
                relative = 0;
                while(ctx.parent)ctx = ctx.parent;
        }
        if (this.options.relativeTo) relative += this.relativeToGetter(parent.val);
        this.offsetType.encode(stream, ctx.pointerOffset - relative);
        let { type: type } = this;
        if (type == null) {
            if (!(val instanceof $92184962f8f0d5e2$export$df5cb1f3d04f5a0f)) throw new Error("Must be a VoidPointer");
            ({ type: type } = val);
            val = val.value;
        }
        ctx.pointers.push({
            type: type,
            val: val,
            parent: parent
        });
        return ctx.pointerOffset += type.size(val, parent);
    }
}
class $92184962f8f0d5e2$export$df5cb1f3d04f5a0f {
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}


$parcel$exportWildcard(module.exports, $4559ecf940edc78d$exports);
$parcel$exportWildcard(module.exports, $af65abf7bf65ac42$exports);
$parcel$exportWildcard(module.exports, $92184962f8f0d5e2$exports);


//# sourceMappingURL=main.cjs.map
