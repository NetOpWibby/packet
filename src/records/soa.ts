


/// import

import { Buffer } from "/dep.ts";

/// util

import { Name } from "../name.ts";



/// export

export class SOA {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: any; } = {};
    const name = new Name();
    const oldOffset = offset;

    offset += 2;
    data.mname = name.decode(buf, offset);
    offset += name.decodeBytes;
    data.rname = name.decode(buf, offset);
    offset += name.decodeBytes;
    data.serial = buf.readUInt32BE(offset);
    offset += 4;
    data.refresh = buf.readUInt32BE(offset);
    offset += 4;
    data.retry = buf.readUInt32BE(offset);
    offset += 4;
    data.expire = buf.readUInt32BE(offset);
    offset += 4;
    data.minimum = buf.readUInt32BE(offset);
    offset += 4;

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
    name.encode(data.mname, buf, offset);
    offset += name.encodeBytes;
    name.encode(data.rname, buf, offset);
    offset += name.encodeBytes;
    buf.writeUInt32BE(data.serial || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.refresh || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.retry || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.expire || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.minimum || 0, offset);
    offset += 4;

    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(data) {
    const name = new Name();
    return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname);
  }
}
