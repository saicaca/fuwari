import {Base} from './Base.js';

export class Bitfield extends Base {
  constructor(type, flags = []) {
    super();
    this.type = type;
    this.flags = flags;
  }

  decode(stream) {
    const val = this.type.decode(stream);

    const res = {};
    for (let i = 0; i < this.flags.length; i++) {
      const flag = this.flags[i];
      if (flag != null) {
        res[flag] = !!(val & (1 << i));
      }
    }

    return res;
  }

  size() {
    return this.type.size();
  }

  encode(stream, keys) {
    let val = 0;
    for (let i = 0; i < this.flags.length; i++) {
      const flag = this.flags[i];
      if (flag != null) {
        if (keys[flag]) { val |= (1 << i); }
      }
    }

    return this.type.encode(stream, val);
  }
}
