


/// import

import { Buffer } from "node:buffer";

/// util

import { TypeBitmap } from "../typebitmap.ts";



/// export

export class NSEC3 {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const length = buf.readUInt16BE(offset);
    const oldOffset = offset;
    const record: { [key: string]: unknown; } = {};
    const typebitmap = new TypeBitmap();

    offset += 2;
    record.algorithm = buf.readUInt8(offset);
    offset += 1;
    record.flags = buf.readUInt8(offset);
    offset += 1;
    record.iterations = buf.readUInt16BE(offset);
    offset += 2;

    const saltLength = buf.readUInt8(offset);
    offset += 1;
    record.salt = buf.slice(offset, offset + saltLength);
    offset += saltLength;

    const hashLength = buf.readUInt8(offset);
    offset += 1;
    record.nextDomain = buf.slice(offset, offset + hashLength);
    offset += hashLength;
    record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset)).sort();
    offset += typebitmap.decodeBytes;

    this.decodeBytes = offset - oldOffset;
    return record;
  }

  encode(record, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(record));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const salt = record.salt;
    const typebitmap = new TypeBitmap();

    if (!Buffer.isBuffer(salt))
      throw new Error("salt must be a Buffer");

    const nextDomain = record.nextDomain;

    if (!Buffer.isBuffer(nextDomain))
      throw new Error("nextDomain must be a Buffer");

    offset += 2; // Leave space for length
    buf.writeUInt8(record.algorithm, offset);
    offset += 1;
    buf.writeUInt8(record.flags, offset);
    offset += 1;
    buf.writeUInt16BE(record.iterations, offset);
    offset += 2;
    buf.writeUInt8(salt.length, offset);
    offset += 1;
    salt.copy(buf, offset, 0, salt.length);
    offset += salt.length;
    buf.writeUInt8(nextDomain.length, offset);
    offset += 1;
    nextDomain.copy(buf, offset, 0, nextDomain.length);
    offset += nextDomain.length;
    typebitmap.encode(record.rrtypes.sort(), buf, offset);
    offset += typebitmap.encodeBytes;

    this.decodeBytes = offset - oldOffset;

    /// NOTE
    /// : commented-out because we don't want blocking errors
    ///   : error bubbles up to nameserver anyway

    // const encodedValue = this.encodeBytes - 2;

    // if (encodedValue < 0 || encodedValue > 65535)
    //   throw new Error("value is out of range");

    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);
    return buf;
  }

  encodingLength(record) {
    const typebitmap = new TypeBitmap();

    return 8 +
      record.salt.length +
      record.nextDomain.length +
      typebitmap.encodingLength(record.rrtypes.sort());
  }
}
