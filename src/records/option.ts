


/// import

import { Buffer } from "/dep.ts";

/// util

import * as ip from "../utility/ip-codec.ts";
import * as optioncodes from "../utility/optioncodes.ts";



/// export

export class OPTION {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset) {
    if (!offset)
      offset = 0;

    const option: { [key: string]: any; } = {};
    option.code = buf.readUInt16BE(offset);
    option.type = optioncodes.toString(option.code);
    offset += 2;

    const len = buf.readUInt16BE(offset);
    offset += 2;
    option.data = buf.slice(offset, offset + len);

    switch(option.code) {
      // case 3: NSID. No decode makes sense.

      case 8: { // ECS
        option.family = buf.readUInt16BE(offset);
        offset += 2;
        option.sourcePrefixLength = buf.readUInt8(offset++);
        option.scopePrefixLength = buf.readUInt8(offset++);

        const padded = Buffer.alloc((option.family === 1) ? 4 : 16);
        buf.copy(padded, 0, offset, offset + len - 4);
        option.ip = ip.decode(padded);

        break;
      }

      // case 12: Padding. No decode makes sense.

      case 11: { // KEEP-ALIVE
        if (len > 0) {
          option.timeout = buf.readUInt16BE(offset);
          offset += 2;
        }

        break;
      }

      case 14: {
        option.tags = [];

        for (let i = 0; i < len; i += 2) {
          option.tags.push(buf.readUInt16BE(offset));
          offset += 2;
        }
      }

      // do not worry about default. caller will use data if desired
    }

    this.decodeBytes = len + 4;
    return option;
  }

  encode(option, buf, offset) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(option));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const code = optioncodes.toCode(option.code);

    buf.writeUInt16BE(code, offset);
    offset += 2;

    if (option.data) {
      buf.writeUInt16BE(option.data.length, offset);
      offset += 2;
      option.data.copy(buf, offset);
      offset += option.data.length;
    } else {
      switch(code) {
        // case 3: NSID. No encode makes sense.
        // case 5,6,7: Not implementable

        case 8: { // ECS
          // note: do IP math before calling
          const spl = option.sourcePrefixLength || 0;
          const fam = option.family || ip.familyOf(option.ip);
          const ipBuf = ip.encode(option.ip, Buffer.alloc);
          const ipLen = Math.ceil(spl / 8);

          buf.writeUInt16BE(ipLen + 4, offset);
          offset += 2;
          buf.writeUInt16BE(fam, offset);
          offset += 2;
          buf.writeUInt8(spl, offset++);
          buf.writeUInt8(option.scopePrefixLength || 0, offset++);
          ipBuf.copy(buf, offset, 0, ipLen);
          offset += ipLen;

          break;
        }

        // case 9: EXPIRE (experimental)
        // case 10: COOKIE.  No encode makes sense.

        case 11: { // KEEP-ALIVE
          if (option.timeout) {
            buf.writeUInt16BE(2, offset);
            offset += 2;
            buf.writeUInt16BE(option.timeout, offset);
            offset += 2;
          } else {
            buf.writeUInt16BE(0, offset);
            offset += 2;
          }

          break;
        }

        case 12: { // PADDING
          const len = option.length || 0;

          buf.writeUInt16BE(len, offset);
          offset += 2;
          buf.fill(0, offset, offset + len);
          offset += len;

          break;
        }

        // case 13:  CHAIN.  Experimental.

        case 14: { // KEY-TAG
          const tagsLen = option.tags.length * 2;
          buf.writeUInt16BE(tagsLen, offset);
          offset += 2;

          for (const tag of option.tags) {
            buf.writeUInt16BE(tag, offset);
            offset += 2;
          }

          break;
        }

        default: {
          throw new Error(`Unknown roption code: ${option.code}`);
        }
      }
    }

    this.encodeBytes = offset - oldOffset;
    return buf;
  }

  encodingLength(option) {
    if (option.data)
      return option.data.length + 4;

    const code = optioncodes.toCode(option.code);

    switch(code) {
      case 8: { // ECS
        const spl = option.sourcePrefixLength || 0;
        return Math.ceil(spl / 8) + 8;
      }

      case 11: // KEEP-ALIVE
        return (typeof option.timeout === "number") ? 6 : 4;

      case 12: // PADDING
        return option.length + 4;

      case 14: // KEY-TAG
        return 4 + (option.tags.length * 2);
    }

    throw new Error(`Unknown roption code: ${option.code}`);
  }
}
