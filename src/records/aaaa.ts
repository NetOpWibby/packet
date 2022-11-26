


/// import

import { Buffer } from "std/node/internal/buffer.mjs";

/// util

import * as ip from "../utility/ip-codec.ts";



/// export

export class AAAA {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    offset += 2;
    const host = ip.v6.decode(buf, offset);
    this.decodeBytes = 18;

    return host;
  }

  encode(host, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength());

    if (!offset)
      offset = 0;

    buf.writeUInt16BE(16, offset);
    offset += 2;
    ip.v6.encode(host, buf, offset);
    this.encodeBytes = 18;

    return buf;
  }

  encodingLength() {
    return 18;
  }
}
