


/// import

import { Buffer } from "node:buffer";

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

    /// saving buffers in our nameserver database is annoying, so we store them as strings…
    /// `packet` expects buffers, so let's convert 'em real quick

    result.answers && result.answers.map(answer => {
      answer = processBuffer(answer);
      return answer;
    });

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



/// helper

function processBuffer(rr) {
  if (!rr.type)
    return rr;

  switch(rr.type) {
    case "DNSKEY": {
      if (typeof rr.data.key === "string")
        rr.data.key = new Buffer(rr.data.key);

      return rr;
    }

    case "DS": {
      if (typeof rr.data.digest === "string")
        rr.data.digest = new Buffer(rr.data.digest);

      return rr;
    }

    case "NSEC3": {
      if (typeof rr.data.nextDomain === "string")
        rr.data.nextDomain = new Buffer(rr.data.nextDomain);

      if (typeof rr.data.salt === "string")
        rr.data.salt = new Buffer(rr.data.salt);

      return rr;
    }

    case "NULL": {
      if (typeof rr.data === "string")
        rr.data = new Buffer(rr.data);

      return rr;
    }

    case "RRSIG": {
      if (typeof rr.data.signature === "string")
        rr.data.signature = new Buffer(rr.data.signature);

      return rr;
    }

    case "TXT": {
      if (typeof rr.data === "string")
        rr.data = new Buffer(rr.data);

      return rr;
    }

    default:
      return rr;
  }
}
