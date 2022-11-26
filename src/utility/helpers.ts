


/// export

export function decodeList(list, enc, buf, offset) {
  for (let i = 0; i < list.length; i++) {
    list[i] = enc.decode(buf, offset);
    offset += enc.decodeBytes;
  }

  return offset;
}

export function encodeList(list, enc, buf, offset) {
  for (let i = 0; i < list.length; i++) {
    enc.encode(list[i], buf, offset);
    offset += enc.encodeBytes;
  }

  return offset;
}

export function encodingLengthList(list, enc) {
  let len = 0;

  for (let i = 0; i < list.length; i++)
    len += enc.encodingLength(list[i]);

  return len;
}
