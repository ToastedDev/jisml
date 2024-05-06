import { Command } from "commander";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { pushCommand } from "./commands/push";

async function getVersion() {
  const packageJsonPath = join(__dirname, "../../package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  return packageJson?.version ?? "1.0.0";
}

async function main() {
  const program = new Command()
    .name("jisml")
    .description("An ORM that makes JSON a database")
    .version(await getVersion());

  program.addCommand(pushCommand);

  program.parse(process.argv);
}

main();
