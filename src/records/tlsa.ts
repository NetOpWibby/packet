


/// import

import { Buffer } from "node:buffer";



/// export

export class TLSA {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const cert: { [key: string]: unknown; } = {};
    const length = buf.readUInt16BE(offset);
    const oldOffset = offset;

    offset += 2;
    cert.usage = buf.readUInt8(offset);
    offset += 1;
    cert.selector = buf.readUInt8(offset);
    offset += 1;
    cert.matchingType = buf.readUInt8(offset);
    offset += 1;
    cert.certificate = buf.slice(offset, oldOffset + length + 2);
    offset += (cert.certificate as Buffer).length;

    this.decodeBytes = offset - oldOffset;
    return cert;
  }

  encode(cert, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(cert));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const certdata = cert.certificate;

    if (!Buffer.isBuffer(certdata))
      throw new Error("Certificate must be a Buffer");

    offset += 2; // Leave space for length
    buf.writeUInt8(cert.usage, offset);
    offset += 1;
    buf.writeUInt8(cert.selector, offset);
    offset += 1;
    buf.writeUInt8(cert.matchingType, offset);
    offset += 1;
    certdata.copy(buf, offset, 0, certdata.length);
    offset += certdata.length;

    this.encodeBytes = offset - oldOffset;
    buf.writeUInt16BE(this.encodeBytes - 2, oldOffset);

    return buf;
  }

  encodingLength(cert) {
    return 5 + Buffer.byteLength(cert.certificate);
  }
}
