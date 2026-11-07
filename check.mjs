import { readdirSync, statSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

function listJs(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listJs(p));
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = listJs("js");
let errors = 0;
const lines = [];
for (const f of files) {
  try {
    execSync(`node --check "${f}"`, { stdio: "pipe" });
    lines.push("OK   " + f);
  } catch (e) {
    errors++;
    lines.push("FAIL " + f);
    lines.push(String(e.stderr || e.stdout || e.message));
  }
}
lines.push(`\nTOTAL ERRORES: ${errors}`);
writeFileSync("check-result.txt", lines.join("\n"), "utf8");
process.exit(errors ? 1 : 0);
