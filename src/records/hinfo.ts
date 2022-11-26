


/// import

import { Buffer } from "std/node/internal/buffer.mjs";

/// util

import { String } from "../string.ts";



/// export

export class HINFO {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: any; } = {};
    const oldOffset = offset;
    const sstring = new String();

    offset += 2;
    data.cpu = sstring.decode(buf, offset);
    offset += sstring.decodeBytes;
    data.os = sstring.decode(buf, offset);
    offset += sstring.decodeBytes;
    this.decodeBytes = offset - oldOffset;

    return data;
  }

  encode(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const sstring = new String();

    offset += 2;
    sstring.encode(data.cpu, buf, offset);
    offset += sstring.encodeBytes;
    sstring.encode(data.os, buf, offset);
    offset += sstring.encodeBytes;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(data) {
    const sstring = new String();

    return sstring.encodingLength(data.cpu) +
      sstring.encodingLength(data.os) +
      2;
  }
}
