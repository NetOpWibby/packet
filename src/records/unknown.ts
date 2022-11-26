


/// import

import { Buffer } from "/dep.ts";



/// export

export class UNKNOWN {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const len = buf.readUInt16BE(offset);
    const data = buf.slice(offset + 2, offset + 2 + len);

    this.decodeBytes = len + 2;
    return data;
  }

  encode(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    buf.writeUInt16BE(data.length, offset);
    data.copy(buf, offset + 2);

    this.encodeBytes = data.length + 2;
    return buf;
  }

  encodingLength(data) {
    return data.length + 2;
  }
}
