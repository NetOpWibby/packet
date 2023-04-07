


/// import

import { Buffer } from "node:buffer";



/// export

export class Name {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const list = [];
    let consumedBytes = 0;
    let jumped = false;
    let oldOffset = offset;
    let totalLength = 0;

    while(true) {
      if (offset >= buf.length)
        throw new Error("Cannot decode name (buffer overflow)");

      const len = buf[offset++];
      consumedBytes += jumped ? 0 : 1;

      if (len === 0) {
        break;
      } else if ((len & 0xc0) === 0) {
        if (offset + len > buf.length)
          throw new Error("Cannot decode name (buffer overflow)");

        totalLength += len + 1;

        if (totalLength > 254)
          throw new Error("Cannot decode name (name too long)");

        // @ts-ignore | TS2345 [ERROR]: Argument of type "any" is not assignable to parameter of type "never".
        list.push(buf.toString("utf-8", offset, offset + len));
        offset += len;
        consumedBytes += jumped ? 0 : len;
      } else if ((len & 0xc0) === 0xc0) {
        if (offset + 1 > buf.length)
          throw new Error("Cannot decode name (buffer overflow)");

        const jumpOffset = buf.readUInt16BE(offset - 1) - 0xc000;

        if (jumpOffset >= oldOffset) {
          // Allow only pointers to prior data. RFC 1035, section 4.1.4 states:
          // "[...] an entire domain name or a list of labels at the end of a domain name
          // is replaced with a pointer to a prior occurance (sic) of the same name."
          throw new Error("Cannot decode name (bad pointer)");
        }

        offset = jumpOffset;
        oldOffset = jumpOffset;
        consumedBytes += jumped ? 0 : 1;
        jumped = true;
      } else {
        throw new Error("Cannot decode name (bad label)");
      }
    }

    this.decodeBytes = consumedBytes;

    return list.length === 0 ?
      "." :
      list.join(".");
  }

  encode(str, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(str));

    if (!offset)
      offset = 0;

    const oldOffset = offset;

    // strip leading and trailing .
    const n = str.replace(/^\.|\.$/gm, "");
    if (n.length) {
      const list = n.split(".");

      for (let i = 0; i < list.length; i++) {
        const len = buf.write(list[i], offset + 1);

        buf[offset] = len;
        offset += len + 1;
      }
    }

    buf[offset++] = 0;
    this.encodeBytes = offset - oldOffset;

    return buf;
  }

  encodingLength(n) {
    if (n === "." || n === "..")
      return 1;

    return Buffer.byteLength(n.replace(/^\.|\.$/gm, "")) + 2;
  }
}
