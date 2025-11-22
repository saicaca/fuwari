import {Base} from './Base.js';
import {Number as NumberT} from './Number.js';
import * as utils from './utils.js';

export class BufferT extends Base {
  constructor(length) {
    super();
    this.length = length;
  }
  
  decode(stream, parent) {
    const length = utils.resolveLength(this.length, stream, parent);
    return stream.readBuffer(length);
  }

  size(val, parent) {
    if (!val) {
      return utils.resolveLength(this.length, null, parent);
    }

    let len = val.length;
    if (this.length instanceof NumberT) {
      len += this.length.size();
    }

    return len;
  }

  encode(stream, buf, parent) {
    if (this.length instanceof NumberT) {
      this.length.encode(stream, buf.length);
    }

    return stream.writeBuffer(buf);
  }
}

export {BufferT as Buffer};
