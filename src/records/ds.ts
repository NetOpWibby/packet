


/// import

import { Buffer } from "std/node/internal/buffer.mjs";



/// export

export class DS {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const digest: { [key: string]: any; } = {};
    const length = buf.readUInt16BE(offset);
    const oldOffset = offset;

    offset += 2;
    digest.keyTag = buf.readUInt16BE(offset);
    offset += 2;
    digest.algorithm = buf.readUInt8(offset);
    offset += 1;
    digest.digestType = buf.readUInt8(offset);
    offset += 1;
    digest.digest = buf.slice(offset, oldOffset + length + 2);
    offset += digest.digest.length;

    this.decodeBytes = offset - oldOffset;
    return digest;
  }

  encode(digest, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(digest));

    if (!offset)
      offset = 0;

    const digestdata = digest.digest;
    const oldOffset = offset;

    if (!Buffer.isBuffer(digestdata))
      throw new Error("Digest must be a Buffer");

    offset += 2; // Leave space for length
    buf.writeUInt16BE(digest.keyTag, offset);
    offset += 2;
    buf.writeUInt8(digest.algorithm, offset);
    offset += 1;
    buf.writeUInt8(digest.digestType, offset);
    offset += 1;
    digestdata.copy(buf, offset, 0, digestdata.length);
    offset += digestdata.length;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(digest) {
    return 6 + Buffer.byteLength(digest.digest);
  }
}
