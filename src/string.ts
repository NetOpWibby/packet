


/// import

import { Buffer } from "node:buffer";



/// export

export class String {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const len = buf[offset];
    const s = buf.toString("utf-8", offset + 1, offset + 1 + len);
    this.decodeBytes = len + 1;

    return s;
  }

  encode(s, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(s));

    if (!offset)
      offset = 0;

    const len = buf.write(s, offset + 1);

    buf[offset] = len;
    this.encodeBytes = len + 1;

    return buf;
  }

  encodingLength(s) {
    return Buffer.byteLength(s) + 1;
  }
}
