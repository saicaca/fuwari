import {Base} from './Base.js';
import * as utils from './utils.js';

export class Reserved extends Base {
  constructor(type, count = 1) {
    super();
    this.type = type;
    this.count = count;
  }
  decode(stream, parent) {
    stream.pos += this.size(null, parent);
    return undefined;
  }

  size(data, parent) {
    const count = utils.resolveLength(this.count, null, parent);
    return this.type.size() * count;
  }

  encode(stream, val, parent) {
    return stream.fill(0, this.size(val, parent));
  }
}
