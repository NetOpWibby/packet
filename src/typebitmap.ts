


/// import

import { Buffer } from "node:buffer";

/// util

import * as types from "./utility/types.ts";



/// export

export class TypeBitmap {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?, length?) {
    if (!offset)
      offset = 0;

    if (!length)
      length = 0;

    const oldOffset = offset;
    const typelist: Array<string> = [];

    while (offset - oldOffset < length) {
      const window = buf.readUInt8(offset);
      offset += 1;
      const windowLength = buf.readUInt8(offset);
      offset += 1;

      for (let i = 0; i < windowLength; i++) {
        const b = buf.readUInt8(offset + i);

        for (let j = 0; j < 8; j++) {
          if (b & (1 << (7 - j))) {
            const typeid = types.toString((window << 8) | (i << 3) | j);
            typelist.push(typeid);
          }
        }
      }

      offset += windowLength;
    }

    this.decodeBytes = offset - oldOffset;
    return typelist;
  }

  encode(typelist, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(typelist));

    if (!offset)
      offset = 0;

    const oldOffset = offset;
    const typesByWindow: unknown[] = [];
    let i;

    for (i = 0; i < typelist.length; i++) {
      const typeid = types.toType(typelist[i]);

      if (typesByWindow[typeid >> 8] === undefined)
        typesByWindow[typeid >> 8] = [];

      (typesByWindow[typeid >> 8] as number[])[(typeid >> 3) & 0x1F] |= 1 << (7 - (typeid & 0x7));
    }

    for (i = 0; i < typesByWindow.length; i++) {
      if (typesByWindow[i] !== undefined) {
        const windowBuf = Buffer.from((typesByWindow[i] as number[]));

        buf.writeUInt8(i, offset);
        offset += 1;
        buf.writeUInt8(windowBuf.length, offset);
        offset += 1;
        windowBuf.copy(buf, offset);
        offset += windowBuf.length;
      }
    }

    this.encodeBytes = offset - oldOffset;
    return buf;
  }

  encodingLength(typelist) {
    const extents: Array<number> = [];
    let i;
    let len = 0;

    for (i = 0; i < typelist.length; i++) {
      const typeid = types.toType(typelist[i]);
      extents[typeid >> 8] = Math.max(extents[typeid >> 8] || 0, typeid & 0xFF);
    }

    for (i = 0; i < extents.length; i++) {
      if (extents[i] !== undefined)
        len += 2 + Math.ceil((extents[i] + 1) / 8);
    }

    return len;
  }
}
