


/// import

import { Buffer } from "/dep.ts";

/// util

import { Answer } from "./answer.ts";
import { Header } from "./header.ts";
import { Question } from "./question.ts";

import {
  decodeList,
  encodeList,
  encodingLengthList
} from "./utility/helpers.ts";



/// export

export class DEFAULT {
  decodeBytes = 0;
  encodeBytes = 0;

  decode(buf, offset?) {
    if (!offset)
      offset = 0;

    const answer = new Answer();
    const header = new Header();
    const oldOffset = offset;
    const question = new Question();
    const result = header.decode(buf, offset);

    offset += header.decodeBytes;
    offset = decodeList(result.questions, question, buf, offset);
    offset = decodeList(result.answers, answer, buf, offset);
    offset = decodeList(result.authorities, answer, buf, offset);
    offset = decodeList(result.additionals, answer, buf, offset);

    this.decodeBytes = offset - oldOffset;
    return result;
  }

  encode(result, buf?, offset?) {
    const allocing = !buf;

    if (allocing)
      buf = Buffer.alloc(this.encodingLength(result));

    if (!offset)
      offset = 0;

    const answer = new Answer();
    const header = new Header();
    const oldOffset = offset;
    const question = new Question();

    if (!result.questions)
      result.questions = [];

    if (!result.answers)
      result.answers = [];

    if (!result.authorities)
      result.authorities = [];

    if (!result.additionals)
      result.additionals = [];

    header.encode(result, buf, offset);

    offset += header.encodeBytes;
    offset = encodeList(result.questions, question, buf, offset);
    offset = encodeList(result.answers, answer, buf, offset);
    offset = encodeList(result.authorities, answer, buf, offset);
    offset = encodeList(result.additionals, answer, buf, offset);

    this.encodeBytes = offset - oldOffset;

    // just a quick sanity check
    if (allocing && this.encodeBytes !== buf.length)
      return buf.slice(0, this.encodeBytes);

    return buf;
  }

  encodingLength(result) {
    const answer = new Answer();
    const header = new Header();
    const question = new Question();

    return header.encodingLength() +
      encodingLengthList(result.questions || [], question) +
      encodingLengthList(result.answers || [], answer) +
      encodingLengthList(result.authorities || [], answer) +
      encodingLengthList(result.additionals || [], answer);
  }
}
