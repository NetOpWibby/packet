


/// import

import { Buffer } from "std/node/internal/buffer.mjs";



/// export

export class TXT {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    let remaining = buf.readUInt16BE(offset);

    offset += 2;
    const data = [];

    while (remaining > 0) {
      const len = buf[offset++];
      --remaining;

      if (remaining < len)
        throw new Error("Buffer overflow");

      // @ts-ignore | TS2345 [ERROR]: Argument of type "any" is not assignable to parameter of type "never".
      data.push(buf.slice(offset, offset + len));
      offset += len;
      remaining -= len;
    }

    this.decodeBytes = offset - oldOffset;
    return data;
  }

  encode(data, buf, offset) {
    if (!Array.isArray(data))
      data = [data];

    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] === "string")
        data[i] = Buffer.from(data[i]);

      if (!Buffer.isBuffer(data[i]))
        throw new Error("Must be a Buffer");
    }

    if (!buf)
      buf = Buffer.alloc(this.encodingLength(data));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    offset += 2;

    data.forEach(function(d) {
      buf[offset++] = d.length;
      d.copy(buf, offset, 0, d.length);
      offset += d.length;
    });

    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(data) {
    if (!Array.isArray(data))
      data = [data];

    let length = 2;

    data.forEach(function(buf) {
      if (typeof buf === "string")
        length += Buffer.byteLength(buf) + 1;
      else
        length += buf.length + 1;
    });

    return length;
  }
}
