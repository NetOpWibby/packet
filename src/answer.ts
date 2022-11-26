


/// import

import { Buffer } from "std/node/internal/buffer.mjs";

/// util

import { FLUSH_MASK, NOT_FLUSH_MASK } from "./utility/constants.ts";
import { Name } from "./name.ts";
import { OPT } from "./records/opt.ts";
import { Record } from "./record.ts";
import * as classes from "./utility/classes.ts";
import * as types from "./utility/types.ts";



/// export

export class Answer {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset) offset = 0;

    const a: { [key: string]: any; } = {};
    const name = new Name();
    const oldOffset = offset;
    const opt = new OPT();

    a.name = name.decode(buf, offset);
    offset += name.decodeBytes;
    a.type = types.toString(buf.readUInt16BE(offset));

    if (a.type === "OPT") {
      a.udpPayloadSize = buf.readUInt16BE(offset + 2);
      a.extendedRcode = buf.readUInt8(offset + 4);
      a.ednsVersion = buf.readUInt8(offset + 5);
      a.flags = buf.readUInt16BE(offset + 6);
      a.flag_do = ((a.flags >> 15) & 0x1) === 1;
      a.options = opt.decode(buf, offset + 8);
      offset += 8 + opt.decodeBytes;
    } else {
      const klass = buf.readUInt16BE(offset + 2);

      a.ttl = buf.readUInt32BE(offset + 4);
      a.class = classes.toString(klass & NOT_FLUSH_MASK);
      a.flush = !!(klass & FLUSH_MASK);

      const enc = Record(a.type);

      a.data = enc.decode(buf, offset + 8);
      offset += 8 + enc.decodeBytes;
    }

    this.decodeBytes = offset - oldOffset;
    return a;
  }

  encode(a, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(a));

    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;
    const opt = new OPT();

    name.encode(a.name, buf, offset);
    offset += name.encodeBytes;

    buf.writeUInt16BE(types.toType(a.type), offset);

    if (a.type.toUpperCase() === "OPT") {
      if (a.name !== ".")
        throw new Error("OPT name must be root.");

      buf.writeUInt16BE(a.udpPayloadSize || 4096, offset + 2);
      buf.writeUInt8(a.extendedRcode || 0, offset + 4);
      buf.writeUInt8(a.ednsVersion || 0, offset + 5);
      buf.writeUInt16BE(a.flags || 0, offset + 6);

      offset += 8;
      opt.encode(a.options || [], buf, offset);
      offset += opt.encodeBytes;
    } else {
      let klass = classes.toClass(a.class === undefined ? "IN" : a.class);

      if (a.flush)
        klass |= FLUSH_MASK; // the 1st bit of the class is the flush bit

      buf.writeUInt16BE(klass, offset + 2);
      buf.writeUInt32BE(a.ttl || 0, offset + 4);
      offset += 8;

      const enc = Record(a.type);
      enc.encode(a.data, buf, offset);
      offset += enc.encodeBytes;
    }

    this.encodeBytes = offset - oldOffset;
    return buf;
  }

  encodingLength(a) {
    const data = (a.data !== null && a.data !== undefined) ?
      a.data :
      a.options;
    const name = new Name();

    return name.encodingLength(a.name) + 8 + Record(a.type).encodingLength(data);
  }
}
