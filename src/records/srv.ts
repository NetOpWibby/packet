


/// import

import { Buffer } from "node:buffer";

/// util

import { Name } from "../name.ts";



/// export

export class SRV {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: unknown; } = {};
    const len = buf.readUInt16BE(offset);
    const name = new Name();

    data.port = buf.readUInt16BE(offset + 6);
    data.priority = buf.readUInt16BE(offset + 2);
    data.target = name.decode(buf, offset + 8);
    data.weight = buf.readUInt16BE(offset + 4);

    this.decodeBytes = len + 2;
    return data;
  }

  encode(data, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const name = new Name();

    buf.writeUInt16BE(data.priority || 0, offset + 2);
    buf.writeUInt16BE(data.weight || 0, offset + 4);
    buf.writeUInt16BE(data.port || 0, offset + 6);
    name.encode(data.target, buf, offset + 8);

    const len = name.encodeBytes + 6;

    buf.writeUInt16BE(len, offset);
    this.encodeBytes = len + 2;

    return buf;
  }

  encodingLength(data) {
    const name = new Name();
    return 8 + name.encodingLength(data.target);
  }
}
