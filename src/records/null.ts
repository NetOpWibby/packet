


/// import

import { Buffer } from "/dep.ts";



/// export

export class NULL {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const len = buf.readUInt16BE(offset);

    offset += 2;
    const data = buf.slice(offset, offset + len);

    offset += len;
    this.decodeBytes = offset - oldOffset;

    return data;
  }

  encode(data, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    if (typeof data === "string")
      data = Buffer.from(data);

    if (!data)
      data = Buffer.alloc(0);

    const oldOffset = offset;
    offset += 2;

    const len = data.length;
    data.copy(buf, offset, 0, len);
    offset += len;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(data) {
    if (!data)
      return 2;

    return (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) + 2;
  }
}
