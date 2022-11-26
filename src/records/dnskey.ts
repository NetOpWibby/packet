


/// import

import { Buffer } from "std/node/internal/buffer.mjs";



/// export

export class DNSKEY {
  decodeBytes = 0;
  encodeBytes = 0;
  PROTOCOL_DNSSEC = 3;
  SECURE_ENTRYPOINT = 0x8000;
  ZONE_KEY = 0x80;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const key: { [key: string]: any; } = {};
    const length = buf.readUInt16BE(offset);

    offset += 2;
    key.flags = buf.readUInt16BE(offset);
    offset += 2;

    if (buf.readUInt8(offset) !== this.PROTOCOL_DNSSEC)
      throw new Error("Protocol must be 3");

    offset += 1;
    key.algorithm = buf.readUInt8(offset);
    offset += 1;
    key.key = buf.slice(offset, oldOffset + length + 2);
    offset += key.key.length;
    this.decodeBytes = offset - oldOffset;

    return key;
  }

  encode(key, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(key));

    if (!offset)
      offset = 0;

    const keydata = key.key;
    const oldOffset = offset;

    if (!Buffer.isBuffer(keydata))
      throw new Error("Key must be a Buffer");

    offset += 2; // Leave space for length
    buf.writeUInt16BE(key.flags, offset);
    offset += 2;
    buf.writeUInt8(this.PROTOCOL_DNSSEC, offset);
    offset += 1;
    buf.writeUInt8(key.algorithm, offset);
    offset += 1;
    keydata.copy(buf, offset, 0, keydata.length);
    offset += keydata.length;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(key) {
    return 6 + Buffer.byteLength(key.key);
  }
}
