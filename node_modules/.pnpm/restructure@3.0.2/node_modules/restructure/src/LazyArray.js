import {Array as ArrayT} from './Array.js';
import {Number as NumberT} from './Number.js';
import * as utils from './utils.js';

export class LazyArray extends ArrayT {
  decode(stream, parent) {
    const { pos } = stream;
    const length = utils.resolveLength(this.length, stream, parent);

    if (this.length instanceof NumberT) {
      parent = {
        parent,
        _startOffset: pos,
        _currentOffset: 0,
        _length: length
      };
    }

    const res = new LazyArrayValue(this.type, length, stream, parent);

    stream.pos += length * this.type.size(null, parent);
    return res;
  }

  size(val, ctx) {
    if (val instanceof LazyArrayValue) {
      val = val.toArray();
    }

    return super.size(val, ctx);
  }

  encode(stream, val, ctx) {
    if (val instanceof LazyArrayValue) {
      val = val.toArray();
    }

    return super.encode(stream, val, ctx);
  }
}

class LazyArrayValue {
  constructor(type, length, stream, ctx) {
    this.type = type;
    this.length = length;
    this.stream = stream;
    this.ctx = ctx;
    this.base = this.stream.pos;
    this.items = [];
  }

  get(index) {
    if ((index < 0) || (index >= this.length)) {
      return undefined;
    }

    if (this.items[index] == null) {
      const { pos } = this.stream;
      this.stream.pos = this.base + (this.type.size(null, this.ctx) * index);
      this.items[index] = this.type.decode(this.stream, this.ctx);
      this.stream.pos = pos;
    }

    return this.items[index];
  }

  toArray() {
    const result = [];
    for (let i = 0, end = this.length; i < end; i++) {
      result.push(this.get(i));
    }
    return result;
  }
}
