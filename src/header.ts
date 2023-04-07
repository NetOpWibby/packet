


/// util

import * as opcodes from "./utility/opcodes.ts";
import * as rcodes from "./utility/rcodes.ts";
import { QUERY_FLAG, RESPONSE_FLAG } from "./utility/constants.ts";



/// export

export class Header {
  decodeBytes = 12;
  encodeBytes = 12;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    if (buf.length < 12)
      throw new Error("Header must be 12 bytes");

    const flags = buf.readUInt16BE(offset + 2);

    return {
      additionals: new Array(buf.readUInt16BE(offset + 10)),
      answers: new Array(buf.readUInt16BE(offset + 6)),
      authorities: new Array(buf.readUInt16BE(offset + 8)),
      flag_aa: ((flags >> 10) & 0x1) === 1,
      flag_ad: ((flags >> 5) & 0x1) === 1,
      flag_cd: ((flags >> 4) & 0x1) === 1,
      flag_qr: ((flags >> 15) & 0x1) === 1,
      flag_ra: ((flags >> 7) & 0x1) === 1,
      flag_rd: ((flags >> 8) & 0x1) === 1,
      flag_tc: ((flags >> 9) & 0x1) === 1,
      flag_z: ((flags >> 6) & 0x1) === 1,
      flags: flags & 32767,
      id: buf.readUInt16BE(offset),
      opcode: opcodes.toString((flags >> 11) & 0xf),
      questions: new Array(buf.readUInt16BE(offset + 4)),
      rcode: rcodes.toString(flags & 0xf),
      type: flags & RESPONSE_FLAG ?
        "response" :
        "query"
    }
  }

  encode(h, buf?, offset?) {
    if (!buf)
      buf = this.encodingLength();

    if (!offset)
      offset = 0;

    const flags = (h.flags || 0) & 32767;
    const type = h.type === "response" ?
      RESPONSE_FLAG :
      QUERY_FLAG;

    buf.writeUInt16BE(h.id || 0, offset);
    buf.writeUInt16BE(flags | type, offset + 2);
    buf.writeUInt16BE(h.questions.length, offset + 4);
    buf.writeUInt16BE(h.answers.length, offset + 6);
    buf.writeUInt16BE(h.authorities.length, offset + 8);
    buf.writeUInt16BE(h.additionals.length, offset + 10);

    return buf;
  }

  encodingLength() {
    return 12;
  }
}
