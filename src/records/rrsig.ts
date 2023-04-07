


/// import

import { Buffer } from "node:buffer";

/// util

import { Name } from "../name.ts";
import * as types from "../utility/types.ts";



/// export

export class RRSIG {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const length = buf.readUInt16BE(offset);
    const name = new Name();
    const sig: { [key: string]: unknown; } = {};

    offset += 2;
    sig.typeCovered = types.toString(buf.readUInt16BE(offset));
    offset += 2;
    sig.algorithm = buf.readUInt8(offset);
    offset += 1;
    sig.labels = buf.readUInt8(offset);
    offset += 1;
    sig.originalTTL = buf.readUInt32BE(offset);
    offset += 4;
    sig.expiration = buf.readUInt32BE(offset);
    offset += 4;
    sig.inception = buf.readUInt32BE(offset);
    offset += 4;
    sig.keyTag = buf.readUInt16BE(offset);
    offset += 2;
    sig.signersName = name.decode(buf, offset);
    offset += name.decodeBytes;
    sig.signature = buf.slice(offset, oldOffset + length + 2);
    offset += (sig.signature as Buffer).length;
    this.decodeBytes = offset - oldOffset;

    return sig;
  }

  encode(sig, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(sig));

    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;
    const signature = sig.signature;

    if (!Buffer.isBuffer(signature))
      throw new Error("Signature must be a Buffer");

    offset += 2; // Leave space for length
    buf.writeUInt16BE(types.toType(sig.typeCovered), offset);
    offset += 2;
    buf.writeUInt8(sig.algorithm, offset);
    offset += 1;
    buf.writeUInt8(sig.labels, offset);
    offset += 1;
    buf.writeUInt32BE(sig.originalTTL, offset);
    offset += 4;
    buf.writeUInt32BE(sig.expiration, offset);
    offset += 4;
    buf.writeUInt32BE(sig.inception, offset);
    offset += 4;
    buf.writeUInt16BE(sig.keyTag, offset);
    offset += 2;
    name.encode(sig.signersName, buf, offset);
    offset += name.encodeBytes;
    signature.copy(buf, offset, 0, signature.length);
    offset += signature.length;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(sig) {
    const name = new Name();

    return 20 +
      name.encodingLength(sig.signersName) +
      Buffer.byteLength(sig.signature)
  }
}
