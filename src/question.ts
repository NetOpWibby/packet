


/// import

import { Buffer } from "node:buffer";

/// util

import { NOT_QU_MASK, QU_MASK } from "./utility/constants.ts";
import { Name } from "./name.ts";
import * as classes from "./utility/classes.ts";
import * as types from "./utility/types.ts";



/// export

export class Question {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;
    const q: { [key: string]: unknown; } = {};

    q.name = name.decode(buf, offset);
    offset += name.decodeBytes;
    q.type = types.toString(buf.readUInt16BE(offset));
    offset += 2;
    q.class = classes.toString(buf.readUInt16BE(offset));
    offset += 2;

    const qu = !!(Number(q.class) & QU_MASK);

    if (qu) // `q.class &= NOT_QU_MASK` is equivalent to `q.class = q.class & NOT_QU_MASK`.
      q.class = Number(q.class) & NOT_QU_MASK;

    this.decodeBytes = offset - oldOffset;
    return q;
  }

  encode(q, buf?, offset?) {
    if (!buf)
      buf = Buffer.alloc(this.encodingLength(q));

    if (!offset)
      offset = 0;

    const name = new Name();
    const oldOffset = offset;

    name.encode(q.name, buf, offset);
    offset += name.encodeBytes;
    buf.writeUInt16BE(types.toType(q.type), offset);
    offset += 2;
    buf.writeUInt16BE(classes.toClass(q.class === undefined ? "IN" : q.class), offset);
    offset += 2;

    this.encodeBytes = offset - oldOffset;
    return q;
  }

  encodingLength(q) {
    const name = new Name();
    return name.encodingLength(q.name) + 4;
  }
}
