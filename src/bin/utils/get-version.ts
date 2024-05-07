import { join } from "node:path";
import { readFile } from "node:fs/promises";

export async function getVersion() {
  const packageJsonPath = join(__dirname, "../../../package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  return packageJson?.version ?? "1.0.0";
}
