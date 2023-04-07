


/// import

import { Buffer } from "node:buffer";

/// util

import { Name } from "../name.ts";
import { String } from "../string.ts";



/// export

export class NAPTR {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const data: { [key: string]: unknown; } = {};
    const name = new Name();
    const oldOffset = offset;
    const string = new String();

    offset += 2;
    data.order = buf.readUInt16BE(offset);

    offset += 2;
    data.preference = buf.readUInt16BE(offset);

    offset += 2;
    data.flags = string.decode(buf, offset);

    offset += string.decodeBytes;
    data.services = string.decode(buf, offset);

    offset += string.decodeBytes;
    data.regexp = string.decode(buf, offset);

    offset += string.decodeBytes;
    data.replacement = name.decode(buf, offset);

    offset += name.decodeBytes;
    this.decodeBytes = offset - oldOffset;

    return data;
  }

  encode(data, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;
    const string = new String();

    offset += 2;
    buf.writeUInt16BE(data.order || 0, offset);
    offset += 2;
    buf.writeUInt16BE(data.preference || 0, offset);
    offset += 2;

    string.encode(data.flags, buf, offset);
    offset += string.encodeBytes;

    string.encode(data.services, buf, offset);
    offset += string.encodeBytes;

    string.encode(data.regexp, buf, offset);
    offset += string.encodeBytes;

    name.encode(data.replacement, buf, offset);
    offset += name.encodeBytes;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(data) {
    const string = new String();

    return string.encodingLength(data.flags) +
      string.encodingLength(data.services) +
      string.encodingLength(data.regexp) +
      new Name().encodingLength(data.replacement) + 6;
  }
}
