


/// import

import { Buffer } from "node:buffer";

/// util

import { String } from "../string.ts";



/// export

export class CAA {
  decodeBytes = 0;
  encodeBytes = 0;
  ISSUER_CRITICAL = 1 << 7;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const len = buf.readUInt16BE(offset);
    offset += 2;

    const data: { [key: string]: unknown; } = {};
    const oldOffset = offset;
    const string = new String();

    data.flags = buf.readUInt8(offset);
    offset += 1;
    data.tag = string.decode(buf, offset);
    offset += string.decodeBytes;
    data.value = buf.toString("utf-8", offset, oldOffset + len);
    data.issuerCritical = !!(Number(data.flags) & this.ISSUER_CRITICAL);
    this.decodeBytes = len + 2;

    return data;
  }

  encode(data, buf?, offset?) {
    const len = this.encodingLength(data);
    const string = new String();

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
    string.encode(data.tag, buf, offset);
    offset += string.encodeBytes;
    buf.write(data.value, offset);
    offset += Buffer.byteLength(data.value);
    this.encodeBytes = len;

    return buf;
  }

  encodingLength(data) {
    const string = new String();

    return string.encodingLength(data.tag) +
      string.encodingLength(data.value) +
      2;
  }
}
