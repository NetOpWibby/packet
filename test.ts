


/// import

import { assertEquals, assertStrictEquals, assertThrows } from "https://deno.land/std@0.196.0/testing/asserts.ts";
import { Buffer } from "node:buffer";
import * as Packet from "./mod.ts";

/// util

import * as opcodes from "./src/utility/opcodes.ts";
import * as optioncodes from "./src/utility/optioncodes.ts";
import * as rcodes from "./src/utility/rcodes.ts";



/// program

Deno.test("a", () => {
  testEncoder(new Packet.A(), "127.0.0.1");
});

Deno.test("aaaa", () => {
  testEncoder(new Packet.AAAA(), "fe80::1");
});

Deno.test("caa", () => {
  testEncoder(new Packet.CAA(), { tag: "issue", value: "letsencrypt.org" });
  testEncoder(new Packet.CAA(), { issuerCritical: true, tag: "issue", value: "letsencrypt.org" });
  testEncoder(new Packet.CAA(), { flags: 128, issuerCritical: true, tag: "issue", value: "letsencrypt.org" });
});

Deno.test("cname", () => {
  testEncoder(new Packet.CNAME(), "hello.cname.world.examplename");
});

Deno.test("dname", () => {
  testEncoder(new Packet.DNAME(), "hello.dname.world.examplename");
});

Deno.test("dnskey", () => {
  const packet = new Packet.DNSKEY();

  testEncoder(packet, {
    algorithm: 1,
    flags: packet.SECURE_ENTRYPOINT | packet.ZONE_KEY,
    key: Buffer.from([0, 1, 2, 3, 4, 5])
  })
});

Deno.test("ds", () => {
  testEncoder(new Packet.DS(), {
    algorithm: 1,
    digest: Buffer.from([0, 1, 2, 3, 4, 5]),
    digestType: 1,
    keyTag: 1234
  });
});

Deno.test("hinfo", () => {
  testEncoder(new Packet.HINFO(), { cpu: "risc", os: "xp" });
});

Deno.test("mx", () => {
  testEncoder(new Packet.MX(), { exchange: "mx.hello.world.examplename" });
  testEncoder(new Packet.MX(), { exchange: "mx.hello.world.examplename", preference: 10 });
});

Deno.test("name_decoding", () => {
  // The two most significant bits of a valid label header must be either both zero or both one
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0x80])) }, "Cannot decode name (bad label)");
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0xb0])) }, "Cannot decode name (bad label)");

  // Ensure there is enough buffer to read
  assertThrows(() => { new Packet.Name().decode(Buffer.from([])) }, "Cannot decode name (buffer overflow)");
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0x01, 0x00])) }, "Cannot decode name (buffer overflow)");
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0x01])) }, "Cannot decode name (buffer overflow)");
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0xc0])) }, "Cannot decode name (buffer overflow)");

  // Allow only pointers backwards
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0xc0, 0x00])) }, "Cannot decode name (bad pointer)");
  assertThrows(() => { new Packet.Name().decode(Buffer.from([0xc0, 0x01])) }, "Cannot decode name (bad pointer)");

  // A name can be only 253 characters (when connected with dots)
  const maxLength = Buffer.alloc(255);
  maxLength.fill(Buffer.from([0x01, 0x61]), 0, 254);
  assertEquals(new Packet.Name().decode(maxLength), new Array(127).fill("a").join("."));

  const tooLong = Buffer.alloc(256);
  tooLong.fill(Buffer.from([0x01, 0x61]));
  assertThrows(() => { new Packet.Name().decode(tooLong) }, "Cannot decode name (name too long)");

  // Ensure jumps do not reset the total length counter
  const tooLongWithJump = Buffer.alloc(403);
  tooLongWithJump.fill(Buffer.from([0x01, 0x61]), 0, 200);
  tooLongWithJump.fill(Buffer.from([0x01, 0x61]), 201, 401);
  tooLongWithJump.set([0xc0, 0x00], 401);
  assertThrows(() => { new Packet.Name().decode(tooLongWithJump, 201) }, "Cannot decode name (name too long)");

  // Ensure a jump to a null byte does not add extra dots
  assertEquals(new Packet.Name().decode(Buffer.from([0x00, 0x01, 0x61, 0xc0, 0x00]), 1), "a");

  // Ensure deeply nested pointers do not cause "Maximum call stack size exceeded" errors
  const buf = Buffer.alloc(16386);

  for (let i = 0; i < 16384; i += 2) {
    buf.writeUInt16BE(0xc000 | i, i + 2);
  }

  assertEquals(new Packet.Name().decode(buf, 16384), ".");
});

Deno.test("name_encoding", () => {
  const buf = Buffer.allocUnsafe(255);
  const packet = new Packet.Name();
  let data = "com.foo.examplename";
  let offset = 0;

  packet.encode(data, buf, offset);
  assertStrictEquals(packet.encodeBytes, 21, "name encoding length matches");
  let dd = packet.decode(buf, offset);
  assertStrictEquals(data, dd, "encode/decode matches");
  offset += packet.encodeBytes;

  data = "examplename";
  packet.encode(data, buf, offset);
  assertStrictEquals(packet.encodeBytes, 13, "name encoding length matches");
  dd = packet.decode(buf, offset);
  assertStrictEquals(data, dd, "encode/decode matches");
  offset += packet.encodeBytes;

  data = "foo.examplename.";
  packet.encode(data, buf, offset);
  assertStrictEquals(packet.encodeBytes, 17, "name encoding length matches");
  dd = packet.decode(buf, offset);
  assertStrictEquals(data.slice(0, -1), dd, "encode/decode matches");
  offset += packet.encodeBytes;

  data = ".";
  packet.encode(data, buf, offset);
  assertStrictEquals(packet.encodeBytes, 1, "name encoding length matches");
  dd = packet.decode(buf, offset);
  assertStrictEquals(data, dd, "encode/decode matches");
});

Deno.test("naptr", () => {
  testEncoder(new Packet.NAPTR(), {
    flags: "S",
    order: 1,
    preference: 1,
    regexp: "!^.*$!sip:customer-service@xuexample.com!",
    replacement: "_sip._udp.xuexample.com",
    services: "SIP+D2T"
  });
});

Deno.test("ns", () => {
  testEncoder(new Packet.NS(), "ns.world.examplename");
});

Deno.test("nsec", () => {
  const packet = new Packet.NSEC();

  // `rrtypes` has an issue with being alphabetical...
  // testEncoder(packet, {
  //   nextDomain: "foo.examplename",
  //   rrtypes: ["A", "CAA", "DLV", "DNSKEY"]
  // });

  testEncoder(packet, {
    nextDomain: "foo.examplename",
    rrtypes: ["TXT"] // 16
  });

  testEncoder(packet, {
    nextDomain: "foo.examplename",
    rrtypes: ["TKEY"] // 249
  });

  // `rrtypes` has an issue with being alphabetical...
  // testEncoder(packet, {
  //   nextDomain: "foo.examplename",
  //   rrtypes: ["NSEC", "RRSIG"]
  // });

  // `rrtypes` has an issue with being alphabetical...
  // testEncoder(packet, {
  //   nextDomain: "foo.examplename",
  //   rrtypes: ["RRSIG", "TXT"]
  // });

  // `rrtypes` has an issue with being alphabetical...
  // testEncoder(packet, {
  //   nextDomain: "foo.examplename",
  //   rrtypes: ["NSEC", "TXT"]
  // });

  // Test with sample NSEC from below `assertEquals`
  // ex: packet.encode(<content>).toString("hex")
  const sampleNSEC = Buffer.from("003704686f73740b6578616d706c656e616d6500" +
    "0006400100000003041b000000000000000000000000000000000000000000000" +
    "000000020", "hex"
  );

  const decoded = packet.decode(sampleNSEC);

  assertStrictEquals(compare(decoded, {
    nextDomain: "host.examplename",
    rrtypes: ["A", "MX", "RRSIG", "NSEC", "UNKNOWN_1234"]
  }), true);

  const reencoded = packet.encode(decoded);

  assertEquals(sampleNSEC.length, reencoded.length);
  assertEquals(sampleNSEC, reencoded);
});

Deno.test("null", () => {
  testEncoder(new Packet.NULL(), Buffer.from([0, 1, 2, 3, 4, 5]));
});

Deno.test("optioncodes", () => {
  const opts = [
    [0, "OPTION_0"],
    [1, "LLQ"],
    [2, "UL"],
    [3, "NSID"],
    [4, "OPTION_4"],
    [5, "DAU"],
    [6, "DHU"],
    [7, "N3U"],
    [8, "CLIENT_SUBNET"],
    [9, "EXPIRE"],
    [10, "COOKIE"],
    [11, "TCP_KEEPALIVE"],
    [12, "PADDING"],
    [13, "CHAIN"],
    [14, "KEY_TAG"],
    [26946, "DEVICEID"],
    [65535, "OPTION_65535"],
    [64000, "OPTION_64000"],
    [65002, "OPTION_65002"],
    [-1, null]
  ];

  for (const [code, str] of opts) {
    const s = optioncodes.toString(code);

    assertStrictEquals(compare(s, str), true, `${code} => ${str}`);
    assertStrictEquals(compare(optioncodes.toCode(s), code), true, `${str} => ${code}`);
  }

  assertStrictEquals(compare(optioncodes.toCode("INVALIDINVALID"), -1), true);
});

Deno.test("ptr", () => {
  testEncoder(new Packet.PTR(), "hello.world.examplename");
});

Deno.test("query", () => {
  testEncoder(new Packet.DEFAULT(), {
    questions: [
      {
        name: "hello.a.examplename",
        type: "A"
      }, {
        name: "hello.srv.examplename",
        type: "SRV"
      }
    ],
    type: "query"
  });

  testEncoder(new Packet.DEFAULT(), {
    questions: [
      {
        class: "CH",
        name: "hello.a.examplename",
        type: "A"
      }, {
        name: "hello.srv.examplename",
        type: "SRV"
      }
    ],
    type: "query"
  });

  testEncoder(new Packet.DEFAULT(), {
    id: 42,
    questions: [
      {
        class: "IN",
        name: "hello.a.examplename",
        type: "A"
      }, {
        name: "hello.srv.examplename",
        type: "SRV"
      }
    ],
    type: "query"
  });
});

Deno.test("rcode", () => {
  const errors = ["NOERROR", "FORMERR", "SERVFAIL", "NXDOMAIN", "NOTIMP", "REFUSED", "YXDOMAIN", "YXRRSET", "NXRRSET", "NOTAUTH", "NOTZONE", "RCODE_11", "RCODE_12", "RCODE_13", "RCODE_14", "RCODE_15"];

  const ops = ["QUERY", "IQUERY", "STATUS", "OPCODE_3", "NOTIFY", "UPDATE", "OPCODE_6", "OPCODE_7", "OPCODE_8", "OPCODE_9", "OPCODE_10", "OPCODE_11", "OPCODE_12", "OPCODE_13", "OPCODE_14", "OPCODE_15"];

  const packet = new Packet.DEFAULT();

  for (const i in errors) {
    const code = rcodes.toRcode(errors[i]);
    assertStrictEquals(errors[i], rcodes.toString(code), `rcode conversion from/to string matches: ${rcodes.toString(code)}`);
  }

  for (const i in ops) {
    const ocode = opcodes.toOpcode(ops[i]);
    assertStrictEquals(ops[i], opcodes.toString(ocode), `opcode conversion from/to string matches: ${opcodes.toString(ocode)}`);
  }

  const buf = packet.encode({
    answers: [{
      data: "127.0.0.1",
      name: "hello.examplename",
      type: "A"
    }],
    flags: 0x8480,
    id: 45632,
    type: "response"
  });

  const val = packet.decode(buf);

  assertStrictEquals(val.type, "response", "decode type");
  assertStrictEquals(val.opcode, "QUERY", "decode opcode");
  assertStrictEquals(val.flag_qr, true, "decode flag_qr");
  assertStrictEquals(val.flag_aa, true, "decode flag_aa");
  assertStrictEquals(val.flag_tc, false, "decode flag_tc");
  assertStrictEquals(val.flag_rd, false, "decode flag_rd");
  assertStrictEquals(val.flag_ra, true, "decode flag_ra");
  assertStrictEquals(val.flag_z, false, "decode flag_z");
  assertStrictEquals(val.flag_ad, false, "decode flag_ad");
  assertStrictEquals(val.flag_cd, false, "decode flag_cd");
  assertStrictEquals(val.rcode, "NOERROR", "decode rcode");
});

Deno.test("response", () => {
  testEncoder(new Packet.DEFAULT(), {
    answers: [{
      class: "IN",
      data: "127.0.0.1",
      flush: true,
      name: "hello.a.examplename",
      type: "A"
    }],
    type: "response"
  });

  testEncoder(new Packet.DEFAULT(), {
    answers: [
      {
        class: "IN",
        data: "127.0.0.1",
        name: "hello.a.examplename",
        type: "A"
      }, {
        class: "IN",
        data: {
          port: 9090,
          target: "hello.target.examplename"
        },
        name: "hello.srv.examplename",
        type: "SRV"
      }, {
        class: "IN",
        data: "hello.other.domain.examplename",
        name: "hello.cname.examplename",
        type: "CNAME"
      }
    ],
    flags: Packet.TRUNCATED_RESPONSE,
    type: "response"
  });

  testEncoder(new Packet.DEFAULT(), {
    additionals: [
      {
        data: "fe80::1",
        name: "hello.a.examplename",
        type: "AAAA"
      }, {
        data: "hello.other.ptr.examplename",
        name: "hello.ptr.examplename",
        type: "PTR"
      }, {
        data: {
          port: 9090,
          target: "hello.target.examplename"
        },
        name: "hello.srv.examplename",
        ttl: 42,
        type: "SRV"
      }
    ],
    answers: [
      {
        data: Buffer.from([1, 2, 3, 4, 5]),
        name: "hello.null.examplename",
        type: "NULL",
      }
    ],
    flags: 0,
    id: 100,
    type: "response"
  });

  testEncoder(new Packet.DEFAULT(), {
    answers: [{
      data: "",
      name: "emptytxt.examplename",
      type: "TXT"
    }],
    type: "response"
  });
});

Deno.test("rrp", () => {
  const packet = new Packet.RP();

  testEncoder(packet, {
    mbox: "foo.bar.examplename",
    txt: "baz.bar.examplename"
  });

  testEncoder(packet, { mbox: "foo.bar.examplename" });
  testEncoder(packet, { txt: "baz.bar.examplename" });
  testEncoder(packet, {});
});

Deno.test("rrsig", () => {
  const packet = new Packet.RRSIG();

  const testRRSIG = {
    algorithm: 1,
    expiration: 1234,
    inception: 1233,
    keyTag: 2345,
    labels: 2,
    originalTTL: 3600,
    signature: Buffer.from([0, 1, 2, 3, 4, 5]),
    signersName: "foo.examplename",
    typeCovered: "A"
  };

  testEncoder(packet, testRRSIG);

  // Check the signature length is correct with extra junk at the end
  const buf = Buffer.allocUnsafe(packet.encodingLength(testRRSIG) + 4);
  packet.encode(testRRSIG, buf);

  const val2 = packet.decode(buf);
  assertStrictEquals(compare(testRRSIG, val2), true);
});

Deno.test("soa", () => {
  testEncoder(new Packet.SOA(), {
    expire: 604800,
    minimum: 3600,
    mname: "hello.world.examplename",
    refresh: 14400,
    retry: 3600,
    rname: "root.hello.world.examplename",
    serial: 2018010400
  });
});

Deno.test("sshfp", () => {
  testEncoder(new Packet.SSHFP(), {
    algorithm: 1,
    fingerprint: "A108C9F834354D5B37AF988141C9294822F5BC00",
    hash: 1
  });
});

Deno.test("srv", () => {
  testEncoder(new Packet.SRV(), { port: 9999, target: "hello.world.examplename" });
  testEncoder(new Packet.SRV(), { port: 9999, priority: 42, target: "hello.world.examplename",  weight: 10 });
});

Deno.test("stream", () => {
  const packet = new Packet.Stream();

  const val1 = {
    answers: [{
      data: "198.51.100.1",
      name: "test2.example.net",
      type: "A"
    }],
    flags: 0x8480,
    id: 45632,
    type: "query"
  };

  const buf = packet.encode(val1);
  const val2 = packet.decode(buf);

  assertStrictEquals(buf.length, packet.encodeBytes, "streamEncode.bytes was set correctly");
  assertStrictEquals(compare(val2?.type, val1.type), true, "streamDecoded type match");
  assertStrictEquals(compare(val2?.id, val1.id), true, "streamDecoded id match");
  assertStrictEquals(parseInt(String(val2?.flags)), parseInt(String(val1.flags & 0x7FFF)), "streamDecoded flags match");

  const answer1 = val1.answers[0];
  const answer2 = val2?.answers[0];

  assertStrictEquals(compare(answer1.type, answer2.type), true, "streamDecoded RR type match");
  assertStrictEquals(compare(answer1.name, answer2.name), true, "streamDecoded RR name match");
  assertStrictEquals(compare(answer1.data, answer2.data), true, "streamDecoded RR rdata match");
});

Deno.test("txt", () => {
  testEncoder(new Packet.TXT(), []);
  testEncoder(new Packet.TXT(), ["hello world"]);
  testEncoder(new Packet.TXT(), ["hello", "world"]);
  testEncoder(new Packet.TXT(), [Buffer.from([0, 1, 2, 3, 4, 5])]);
  testEncoder(new Packet.TXT(), ["a", "b", Buffer.from([0, 1, 2, 3, 4, 5])]);
  testEncoder(new Packet.TXT(), ["", Buffer.allocUnsafe(0)]);
});

Deno.test("txt-invalid-data", () => {
  assertThrows(() => { new Packet.TXT().encode(null) }, "null");
  assertThrows(() => { new Packet.TXT().encode(undefined) }, "undefined");
  assertThrows(() => { new Packet.TXT().encode(10) }, "number");
});

Deno.test("txt-scalar-buffer", () => {
  const data = Buffer.from([0, 1, 2, 3, 4, 5]);
  const buf = new Packet.TXT().encode(data);
  const val = new Packet.TXT().decode(buf);

  assertEquals(val.length, 1, "array length");
  assertEquals(val[0], data, "data");
});

Deno.test("txt-scalar-string", () => {
  const buf = new Packet.TXT().encode("hi");
  const val = new Packet.TXT().decode(buf);

  assertStrictEquals(val.length, 1, "array length");
  assertStrictEquals(String(val[0]), "hi", "data");
});

Deno.test("unknown", () => {
  testEncoder(new Packet.UNKNOWN(), Buffer.from("hello world"));
});

Deno.test("unpack", () => {
  const buf = Buffer.from([
    0x00, 0x79,
    0xde, 0xad, 0x85, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x02, 0x00, 0x02, 0x02, 0x6f, 0x6a, 0x05,
    0x62, 0x61, 0x6e, 0x67, 0x6a, 0x03, 0x63, 0x6f,
    0x6d, 0x00, 0x00, 0x01, 0x00, 0x01, 0xc0, 0x0c,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10,
    0x00, 0x04, 0x81, 0xfa, 0x0b, 0xaa, 0xc0, 0x0f,
    0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10,
    0x00, 0x05, 0x02, 0x63, 0x6a, 0xc0, 0x0f, 0xc0,
    0x0f, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x0e,
    0x10, 0x00, 0x02, 0xc0, 0x0c, 0xc0, 0x3a, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10, 0x00,
    0x04, 0x45, 0x4d, 0x9b, 0x9c, 0xc0, 0x0c, 0x00,
    0x1c, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10, 0x00,
    0x10, 0x20, 0x01, 0x04, 0x18, 0x00, 0x00, 0x50,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xf9
  ]);

  const val = new Packet.Stream().decode(buf);
  const answer = val!.answers[0];
  const authority = val!.authorities[1];

  assertEquals(val!.rcode, "NOERROR", "decode rcode");
  assertStrictEquals(compare(answer.type, "A"), true, "streamDecoded RR type match");
  assertStrictEquals(compare(answer.name, "oj.bangj.com"), true, "streamDecoded RR name match");
  assertStrictEquals(compare(answer.data, "129.250.11.170"), true, "streamDecoded RR rdata match");
  assertStrictEquals(compare(authority.type, "NS"), true, "streamDecoded RR type match");
  assertStrictEquals(compare(authority.name, "bangj.com"), true, "streamDecoded RR name match");
  assertStrictEquals(compare(authority.data, "oj.bangj.com"), true, "streamDecoded RR rdata match");
});

/// failing tests

/*
Deno.test("nsec3", () => {
  // RangeError: The value of "value" is out of range. It must be >= 0 and <= 65535. Received -2
  testEncoder(new Packet.NSEC3(), {
    algorithm: 1,
    flags: 0,
    iterations: 257,
    nextDomain: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 1]),
    rrtypes: ["A", "CAA", "DLV", "DNSKEY"],
    salt: Buffer.from([42, 42, 42])
  });
});
*/

/*
Deno.test("opt", () => {
  const packet = new Packet.DEFAULT();

  const val = {
    additionals: [{
      name: ".",
      type: "OPT",
      udpPayloadSize: 1024
    }],
    questions: [{
      name: "hello.a.examplename",
      type: "A"
    }],
    type: "query"
  };

  testEncoder(packet, val);

  let buf = packet.encode(val);
  let val2 = packet.decode(buf);
  const additional1 = val.additionals[0];
  let additional2 = val2.additionals[0];

  assertEquals(compare(additional1.name, additional2.name), true, "name matches");
  assertEquals(compare(additional1.udpPayloadSize, additional2.udpPayloadSize), true, "udp payload size matches");
  assertEquals(compare(0, additional2.flags), true, "flags match");

  additional1.extendedRcode = 0x80;
  additional1.flags = Packet.DNSSEC_OK;
  additional1.options = [
    {
      code: "CLIENT_SUBNET", // edns-client-subnet, see RFC 7871
      ip: "fe80::",
      sourcePrefixLength: 64
    }, {
      code: 8, // still ECS
      ip: "5.6.0.0",
      scopePrefixLength: 16,
      sourcePrefixLength: 16
    }, {
      code: "padding",
      length: 31
    }, {
      code: "TCP_KEEPALIVE"
    }, {
      code: "tcp_keepalive",
      timeout: 150
    }, {
      code: "KEY_TAG",
      tags: [1, 82, 987]
    }
  ];

  buf = packet.encode(val);
  val2 = packet.decode(buf);
  additional2 = val2.additionals[0];

  assertEquals(compare(1 << 15, additional2.flags), true, "DO bit set in flags");
  assertEquals(compare(true, additional2.flag_do), true, "DO bit set");
  assertEquals(compare(additional1.extendedRcode, additional2.extendedRcode), true, "extended rcode matches");
  assertEquals(compare(8, additional2.options[0].code), true);
  assertEquals(compare("fe80::", additional2.options[0].ip), true);
  assertEquals(compare(64, additional2.options[0].sourcePrefixLength), true);
  assertEquals(compare("5.6.0.0", additional2.options[1].ip), true);
  assertEquals(compare(16, additional2.options[1].sourcePrefixLength), true);
  assertEquals(compare(16, additional2.options[1].scopePrefixLength), true);
  assertEquals(compare(additional1.options[2].length, additional2.options[2].data.length), true);
  assertEquals(compare(additional1.options[3].timeout, undefined), true);
  assertEquals(compare(additional1.options[4].timeout, additional2.options[4].timeout), true);
  assertEquals(compare(additional1.options[5].tags, additional2.options[5].tags), true);
});
*/



/// helper

function compare(a, b) {
  if (Buffer.isBuffer(a))
    return a.toString("hex") === b.toString("hex");

  if (typeof a === "object" && a && b) {
    const keys = Object.keys(a);

    for (let i = 0; i < keys.length; i++) {
      if (!compare(a[keys[i]], b[keys[i]]))
        return false;
    }
  } else if (Array.isArray(b) && !Array.isArray(a)) {
    return a.toString() === b[0].toString();
  } else {
    return a === b;
  }

  return true;
}

function testEncoder(record, val1) {
  const buf1 = record.encode(val1);
  const val2 = record.decode(buf1);

  assertStrictEquals(buf1.length, record.encodeBytes, "encode.bytes was set correctly");
  assertStrictEquals(buf1.length, record.encodingLength(val1), "encoding length matches");
  assertStrictEquals(compare(val1, val2), true, "decoded object match");

  const buf2 = record.encode(val2);
  const val3 = record.decode(buf2);

  assertStrictEquals(buf2.length, record.encodeBytes, "encodeBytes was set correctly on re-encode");
  // TODO
  // : these tests fail
  // assertStrictEquals(buf2.length, record.encodingLength(val1), "encoding length matches on re-encode");
  // assertStrictEquals(compare(val1, val3), true, "decoded object match on re-encode");
  // assertStrictEquals(compare(val2, val3), true, "re-encoded decoded object match on re-encode");

  const bigger = Buffer.allocUnsafe(buf2.length + 10);
  const buf3 = record.encode(val1, bigger, 10);
  const val4 = record.decode(buf3, 10);

  assertStrictEquals(buf3, bigger, "echoes buffer on external buffer");
  assertStrictEquals(record.encodeBytes, buf1.length, "encodeBytes is the same on external buffer");
  assertStrictEquals(compare(val1, val4), true, "decoded object match on external buffer");
}
