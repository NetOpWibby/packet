


/// import

import { Buffer } from "https://deno.land/std@0.166.0/node/internal/buffer.mjs";

/// util

import { String } from "../string.ts";



/// export

export class CAA {
  decodeBytes = 0;
  encodeBytes = 0;
  ISSUER_CRITICAL = 1 << 7;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const len = buf.readUInt16BE(offset);
    offset += 2;

    const data: { [key: string]: any; } = {};
    const oldOffset = offset;
    const sstring = new String();

    data.flags = buf.readUInt8(offset);
    offset += 1;
    data.tag = sstring.decode(buf, offset);
    offset += sstring.decodeBytes;
    data.value = buf.toString("utf-8", offset, oldOffset + len);
    data.issuerCritical = !!(data.flags & this.ISSUER_CRITICAL);
    this.decodeBytes = len + 2;

    return data;
  }

  encode(data, buf, offset) {
    const len = this.encodingLength(data);
    const sstring = new String();

    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    if (data.issuerCritical)
      data.flags = this.ISSUER_CRITICAL;

    buf.writeUInt16BE(len - 2, offset);
    offset += 2;
    buf.writeUInt8(data.flags || 0, offset);
    offset += 1;
    sstring.encode(data.tag, buf, offset);
    offset += sstring.encodeBytes;
    buf.write(data.value, offset);
    offset += Buffer.byteLength(data.value);
    this.encodeBytes = len;

    return buf;
  }

  encodingLength(data) {
    const sstring = new String();

    return sstring.encodingLength(data.tag) +
      sstring.encodingLength(data.value) +
      2;
  }
}
