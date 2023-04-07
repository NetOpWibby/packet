


/// import

import { Buffer } from "node:buffer";

/// util

import * as ip from "../utility/ip-codec.ts";



/// export

export class A {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    offset += 2;
    const host = ip.v4.decode(buf, offset);
    this.decodeBytes = 6;

    return host;
  }

  encode(host, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength());

    if (!offset)
      offset = 0;

    buf.writeUInt16BE(4, offset);
    offset += 2;
    ip.v4.encode(host, buf, offset);
    this.encodeBytes = 6;

    return buf;
  }

  encodingLength() {
    return 6;
  }
}
