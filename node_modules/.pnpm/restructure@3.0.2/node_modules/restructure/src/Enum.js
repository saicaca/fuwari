import {Base} from './Base.js';

export class Enum extends Base {
  constructor(type, options = []) {
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
    if (index === -1) {
      throw new Error(`Unknown option in enum: ${val}`);
    }

    return this.type.encode(stream, index);
  }
}
