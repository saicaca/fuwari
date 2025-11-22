import {Struct} from './Struct.js';

const getPath = (object, pathArray) => {
  return pathArray.reduce((prevObj, key) => prevObj && prevObj[key], object);
};

export class VersionedStruct extends Struct {
  constructor(type, versions = {}) {
    super();
    this.type = type;
    this.versions = versions;
    if (typeof type === 'string') {
      this.versionPath = type.split('.');
    }
  }

  decode(stream, parent, length = 0) {
    const res = this._setup(stream, parent, length);

    if (typeof this.type === 'string') {
      res.version = getPath(parent, this.versionPath);
    } else {
      res.version = this.type.decode(stream);
    }

    if (this.versions.header) {
      this._parseFields(stream, res, this.versions.header);
    }

    const fields = this.versions[res.version];
    if ((fields == null)) {
      throw new Error(`Unknown version ${res.version}`);
    }

    if (fields instanceof VersionedStruct) {
      return fields.decode(stream, parent);
    }

    this._parseFields(stream, res, fields);

    if (this.process != null) {
      this.process.call(res, stream);
    }
    return res;
  }

  size(val, parent, includePointers = true) {
    let key, type;
    if (!val) {
      throw new Error('Not a fixed size');
    }

    if (this.preEncode != null) {
      this.preEncode.call(val);
    }

    const ctx = {
      parent,
      val,
      pointerSize: 0
    };

    let size = 0;
    if (typeof this.type !== 'string') {
      size += this.type.size(val.version, ctx);
    }

    if (this.versions.header) {
      for (key in this.versions.header) {
        type = this.versions.header[key];
        if (type.size != null) {
          size += type.size(val[key], ctx);
        }
      }
    }

    const fields = this.versions[val.version];
    if ((fields == null)) {
      throw new Error(`Unknown version ${val.version}`);
    }

    for (key in fields) {
      type = fields[key];
      if (type.size != null) {
        size += type.size(val[key], ctx);
      }
    }

    if (includePointers) {
      size += ctx.pointerSize;
    }

    return size;
  }

  encode(stream, val, parent) {
    let key, type;
    if (this.preEncode != null) {
      this.preEncode.call(val, stream);
    }

    const ctx = {
      pointers: [],
      startOffset: stream.pos,
      parent,
      val,
      pointerSize: 0
    };

    ctx.pointerOffset = stream.pos + this.size(val, ctx, false);

    if (typeof this.type !== 'string') {
      this.type.encode(stream, val.version);
    }

    if (this.versions.header) {
      for (key in this.versions.header) {
        type = this.versions.header[key];
        if (type.encode != null) {
          type.encode(stream, val[key], ctx);
        }
      }
    }

    const fields = this.versions[val.version];
    for (key in fields) {
      type = fields[key];
      if (type.encode != null) {
        type.encode(stream, val[key], ctx);
      }
    }

    let i = 0;
    while (i < ctx.pointers.length) {
      const ptr = ctx.pointers[i++];
      ptr.type.encode(stream, ptr.val, ptr.parent);
    }
  }
}
