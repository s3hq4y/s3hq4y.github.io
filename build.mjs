/* Build script: type-check with tsc, then bundle src/main.ts -> js/os.js */
import { build, context } from "esbuild";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const watch = process.argv.includes("--watch");
const tscPath = fileURLToPath(new URL("./node_modules/typescript/bin/tsc", import.meta.url));

const tsc = spawnSync(process.execPath, [tscPath, "--noEmit"], { stdio: "inherit" });
if (tsc.status !== 0 && !watch) {
  console.error("✖ type-check failed");
  process.exit(1);
}

const cfg = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  outfile: "js/os.js",
  banner: {
    js: "/* s9y OS — bundled TypeScript source in /src · rebuild with `npm run build` */",
  },
  logLevel: "info",
};

if (watch) {
  const ctx = await context(cfg);
  await ctx.watch();
  console.log("watching…");
} else {
  await build(cfg);
  console.log("✔ built js/os.js");
}
