


/// import

import { Buffer } from "/dep.ts";

/// util

import { encodeList, encodingLengthList } from "../utility/helpers.ts"
import { OPTION } from "./option.ts";



/// export

export class OPT {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const option = new OPTION();
    const options: Array<{ [key: string]: any; }> = [];
    let o = 0;
    let rdlen = buf.readUInt16BE(offset);

    offset += 2;

    while (rdlen > 0) {
      options[o++] = option.decode(buf, offset);
      offset += option.decodeBytes;
      rdlen -= option.decodeBytes;
    }

    this.decodeBytes = offset - oldOffset;
    return options;
  }

  encode(options, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(options));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const option = new OPTION();
    const rdlen = encodingLengthList(options, option);

    buf.writeUInt16BE(rdlen, offset);
    offset = encodeList(options, option, buf, offset + 2);
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(options) {
    const option = new OPTION();
    return 2 + encodingLengthList(options || [], option);
  }
}
