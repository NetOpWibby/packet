


/// import

import { Buffer } from "std/node/internal/buffer.mjs";

/// util

import { Name } from "../name.ts";



/// export

export class PTR {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const name = new Name();
    const data = name.decode(buf, offset + 2);
    this.decodeBytes = name.decodeBytes + 2;

    return data;
  }

  encode(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const name = new Name();

    name.encode(data, buf, offset + 2);
    buf.writeUInt16BE(name.encodeBytes, offset);
    this.encodeBytes = name.encodeBytes + 2;

    return buf;
  }

  encodingLength(data) {
    const name = new Name();
    return name.encodingLength(data) + 2;
  }
}
