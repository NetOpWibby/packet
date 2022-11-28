


/// import

import { Buffer } from "https://deno.land/std@0.166.0/node/internal/buffer.mjs";

/// util

import { Name } from "../name.ts";



/// export

export class MX {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: any; } = {};
    const name = new Name();
    const oldOffset = offset;

    offset += 2;
    data.preference = buf.readUInt16BE(offset);
    offset += 2;
    data.exchange = name.decode(buf, offset);
    offset += name.decodeBytes;
    this.decodeBytes = offset - oldOffset;

    return data;
  }

  encode(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;

    offset += 2;
    buf.writeUInt16BE(data.preference || 0, offset);
    offset += 2;
    name.encode(data.exchange, buf, offset);
    offset += name.encodeBytes;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(data) {
    const name = new Name();
    return 4 + name.encodingLength(data.exchange);
  }
}
