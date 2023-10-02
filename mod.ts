


/// export

export { DEFAULT } from "./src/default.ts";

export { Answer } from "./src/answer.ts";
export { Name } from "./src/name.ts";
export { Question } from "./src/question.ts";
export { Record } from "./src/record.ts";
export { Stream } from "./src/stream.ts";

export { A } from "./src/records/a.ts";
export { AAAA } from "./src/records/aaaa.ts";
export { CAA } from "./src/records/caa.ts";
export { DNSKEY } from "./src/records/dnskey.ts";
export { DS } from "./src/records/ds.ts";
export { PTR as CNAME } from "./src/records/ptr.ts";
export { PTR as DNAME } from "./src/records/ptr.ts";
export { HINFO } from "./src/records/hinfo.ts";
export { NAPTR } from "./src/records/naptr.ts";
export { MX } from "./src/records/mx.ts";
export { NS } from "./src/records/ns.ts";
export { NSEC } from "./src/records/nsec.ts";
export { NSEC3 } from "./src/records/nsec3.ts";
export { NULL } from "./src/records/null.ts";
export { OPT } from "./src/records/opt.ts";
export { OPTION } from "./src/records/option.ts";
export { PTR } from "./src/records/ptr.ts";
export { RP } from "./src/records/rp.ts";
export { RRSIG } from "./src/records/rrsig.ts";
export { SSHFP } from "./src/records/sshfp.ts";
export { SOA } from "./src/records/soa.ts";
export { SRV } from "./src/records/srv.ts";
export { TLSA } from "./src/records/tlsa.ts";
export { TXT } from "./src/records/txt.ts";
export { UNKNOWN } from "./src/records/unknown.ts";

export const AUTHENTIC_DATA = 1 << 5;
export const AUTHORITATIVE_ANSWER = 1 << 10;
export const CHECKING_DISABLED = 1 << 4;
export const DNSSEC_OK = 1 << 15;
export const RECURSION_AVAILABLE = 1 << 7;
export const RECURSION_DESIRED = 1 << 8;
export const TRUNCATED_RESPONSE = 1 << 9;



/// forked from v5.4.0 | https://github.com/mafintosh/dns-packet/commit/31d3caf3261dd0a15b867dfb827347c1b175289a
