


/// import

import { Buffer } from "https://deno.land/std@0.166.0/node/internal/buffer.mjs";

/// util

import { Name } from "../name.ts";



/// export

export class NS {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const len = buf.readUInt16BE(offset);
    const dd = new Name().decode(buf, offset + 2);
    this.decodeBytes = len + 2;

    return dd;
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
    return new Name().encodingLength(data) + 2;
  }
}
