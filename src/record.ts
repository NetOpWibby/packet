


/// util

import { A } from "./records/a.ts";
import { AAAA } from "./records/aaaa.ts";
import { CAA } from "./records/caa.ts";
import { DNSKEY } from "./records/dnskey.ts";
import { DS } from "./records/ds.ts";
import { HINFO } from "./records/hinfo.ts";
import { MX } from "./records/mx.ts";
import { NAPTR } from "./records/naptr.ts";
import { NS } from "./records/ns.ts";
import { NSEC } from "./records/nsec.ts";
import { NSEC3 } from "./records/nsec3.ts";
import { NULL } from "./records/null.ts";
import { OPT } from "./records/opt.ts";
import { PTR } from "./records/ptr.ts";
import { RP } from "./records/rp.ts";
import { RRSIG } from "./records/rrsig.ts";
import { SOA } from "./records/soa.ts";
import { SRV } from "./records/srv.ts";
import { SSHFP } from "./records/sshfp.ts";
import { TXT } from "./records/txt.ts";
import { UNKNOWN } from "./records/unknown.ts";



/// export

export function Record(type) {
  switch(type.toUpperCase()) {
    case "A":
      return new A();

    case "AAAA":
      return new AAAA();

    case "CAA":
      return new CAA();

    case "CNAME":
    case "DNAME":
    case "PTR":
      return new PTR();

    case "DNSKEY":
      return new DNSKEY();

    case "DS":
      return new DS();

    case "HINFO":
      return new HINFO();

    case "MX":
      return new MX();

    case "NAPTR":
      return new NAPTR();

    case "NS":
      return new NS();

    case "NSEC":
      return new NSEC();

    case "NSEC3":
      return new NSEC3();

    case "NULL":
      return new NULL();

    case "OPT":
      return new OPT();

    case "RP":
      return new RP();

    case "RRSIG":
      return new RRSIG();

    case "SSHFP":
      return new SSHFP();

    case "SOA":
      return new SOA();

    case "SRV":
      return new SRV();

    case "TXT":
      return new TXT();
  }

  return new UNKNOWN();
}
