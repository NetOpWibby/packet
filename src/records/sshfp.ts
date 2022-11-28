


/// import

import { Buffer } from "https://deno.land/std@0.166.0/node/internal/buffer.mjs";



/// export

export class SSHFP {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const record: { [key: string]: any; } = {};

    offset += 2; // Account for the RDLENGTH field
    record.algorithm = buf[offset];
    offset += 1;
    record.hash = buf[offset];
    offset += 1;

    const fingerprintLength = this.getFingerprintLengthForHashType(record.hash);

    record.fingerprint = buf.slice(offset, offset + fingerprintLength).toString("hex").toUpperCase();
    offset += fingerprintLength;

    this.decodeBytes = offset - oldOffset;
    return record;
  }

  encode(record, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(record));

    if (!offset)
      offset = 0;

    const oldOffset = offset;

    offset += 2; // The function call starts with the offset pointer at the RDLENGTH field, not the RDATA one
    buf[offset] = record.algorithm;
    offset += 1;
    buf[offset] = record.hash;
    offset += 1;

    const fingerprintBuf = Buffer.from(record.fingerprint.toUpperCase(), "hex");

    if (fingerprintBuf.length !== this.getFingerprintLengthForHashType(record.hash))
      throw new Error("Invalid fingerprint length");

    fingerprintBuf.copy(buf, offset);
    offset += fingerprintBuf.byteLength;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(record) {
    return 4 + Buffer.from(record.fingerprint, "hex").byteLength;
  }

  getFingerprintLengthForHashType(hashType) {
    switch(hashType) {
      case 1: return 20;
      case 2: return 32;
    }
  }
}
