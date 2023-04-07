


/// import

import { Buffer } from "node:buffer";

/// util

import { DEFAULT } from "./default.ts";



/// export

export class Stream {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(sbuf) {
    const dfault = new DEFAULT();
    const len = sbuf.readUInt16BE(0);

    // not enough data
    if (sbuf.byteLength < len + 2)
      return null;

    const result = dfault.decode(sbuf.slice(2));
    this.decodeBytes = dfault.decodeBytes;

    return result;
  }

  encode(result) {
    const dfault = new DEFAULT();
    const buf = dfault.encode(result);
    // const sbuf = Buffer.alloc(2); /// causes > TS2339 [ERROR]: Property "writeUInt16BE" does not exist on type "Uint8Array".
    const sbuf = Buffer.from(Buffer.alloc(2));

    sbuf.writeUInt16BE(buf.byteLength);
    const combine = Buffer.concat([sbuf, buf]);

    this.encodeBytes = combine.byteLength;
    return combine;
  }
}
