import TTFFont from './TTFFont';
import WOFFDirectory from './tables/WOFFDirectory';
import tables from './tables';
import inflate from 'tiny-inflate';
import * as r from 'restructure';
import { asciiDecoder } from './utils';

export default class WOFFFont extends TTFFont {
  type = 'WOFF';

  static probe(buffer) {
    return asciiDecoder.decode(buffer.slice(0, 4)) === 'wOFF';
  }

  _decodeDirectory() {
    this.directory = WOFFDirectory.decode(this.stream, { _startOffset: 0 });
  }

  _getTableStream(tag) {
    let table = this.directory.tables[tag];
    if (table) {
      this.stream.pos = table.offset;

      if (table.compLength < table.length) {
        this.stream.pos += 2; // skip deflate header
        let outBuffer = new Uint8Array(table.length);
        let buf = inflate(this.stream.readBuffer(table.compLength - 2), outBuffer);
        return new r.DecodeStream(buf);
      } else {
        return this.stream;
      }
    }

    return null;
  }
}
