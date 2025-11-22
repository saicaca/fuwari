import {Base} from './Base.js';

export class Optional extends Base {
  constructor(type, condition = true) {
    super();
    this.type = type;
    this.condition = condition;
  }

  decode(stream, parent) {
    let { condition } = this;
    if (typeof condition === 'function') {
      condition = condition.call(parent, parent);
    }

    if (condition) {
      return this.type.decode(stream, parent);
    }
  }

  size(val, parent) {
    let { condition } = this;
    if (typeof condition === 'function') {
      condition = condition.call(parent, parent);
    }

    if (condition) {
      return this.type.size(val, parent);
    } else {
      return 0;
    }
  }

  encode(stream, val, parent) {
    let { condition } = this;
    if (typeof condition === 'function') {
      condition = condition.call(parent, parent);
    }

    if (condition) {
      return this.type.encode(stream, val, parent);
    }
  }
}
