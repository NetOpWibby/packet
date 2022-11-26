


/// import

import { Buffer } from "std/node/internal/buffer.mjs";

/// util

import { Name } from "../name.ts";



/// export

export class RP {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: any; } = {};
    const name = new Name();
    const oldOffset = offset;

    offset += 2;
    data.mbox = name.decode(buf, offset) || ".";
    offset += name.decodeBytes;
    data.txt = name.decode(buf, offset) || ".";
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

    offset += 2; // Leave space for length
    name.encode(data.mbox || ".", buf, offset);
    offset += name.encodeBytes;
    name.encode(data.txt || ".", buf, offset);
    offset += name.encodeBytes;
    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(data) {
    const name = new Name();

    return 2 +
      name.encodingLength(data.mbox || ".") +
      name.encodingLength(data.txt || ".");
  }
}
