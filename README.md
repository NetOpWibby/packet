# packet

>  An abstract-encoding compliant module for encoding / decoding DNS packets, for Deno.



## Notes

This module is forked from [mafintosh/dns-packet](https://github.com/mafintosh/dns-packet) because I was trying to track down a Deno compile issue and thought `dns-packet` was the culprit. I was mistaken but I went through the work of refactoring this so no need for that to go to waste. Improvements? Modularity. I'm not a fan of everything in one massive file. Added benefit of TypeScript is that several linting issues were caught and fixed.

This README will be updated when I'm done with my larger project that imports this module. For now, just import what you need from `mod.ts` and refer to [`test.ts`](/test.ts) for usage/reference.

High-level changes:
- written in TypeScript (for Deno)
  - caught and fixed issues with upstream code
  - you can still import into Node.js projects
- modularity
  - every record is its own file
  - utility functions are in their own folder as well
- record functions are now classes so they must be instantiated with `new`
- replaced `decode.bytes` and `encode.bytes` with `decodeBytes`and `encodeBytes` respectively



## Test

```sh
deno test
```
