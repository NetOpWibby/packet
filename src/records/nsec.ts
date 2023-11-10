


/// import

import { Buffer } from "node:buffer";

/// util

import { Name } from "../name.ts";
import { TypeBitmap } from "../typebitmap.ts";



/// export

export class NSEC {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const length = buf.readUInt16BE(offset);
    const name = new Name();
    const oldOffset = offset;
    const record: { [key: string]: unknown; } = {};
    const typebitmap = new TypeBitmap();

    offset += 2;
    record.nextDomain = name.decode(buf, offset);
    offset += name.decodeBytes;
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

    const name = new Name();
    const oldOffset = offset;
    const typebitmap = new TypeBitmap();

    offset += 2; // Leave space for length
    name.encode(record.nextDomain, buf, offset);
    offset += name.encodeBytes;
    typebitmap.encode(record.rrtypes.sort(), buf, offset);
    offset += typebitmap.encodeBytes;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(record) {
    const name = new Name();
    const typebitmap = new TypeBitmap();

    return 2 +
      name.encodingLength(record.nextDomain) +
      typebitmap.encodingLength(record.rrtypes.sort());
  }
}
