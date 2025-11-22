import {Base} from './Base.js';

export class BooleanT extends Base {
  constructor(type) {
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

export {BooleanT as Boolean};
