import { Command } from "commander";
import { pushCommand } from "./commands/push";
import { mainCommandAction } from "./commands/main";
import { getVersion } from "./utils/get-version";

async function main() {
  const program = new Command()
    .name("jisml")
    .description("An ORM that makes JSON a database")
    .version(await getVersion(), "-v, --version", "Output the version number")
    .option("-db, --databaseFile <database file>", "A database file")
    .action(mainCommandAction);

  program.addCommand(pushCommand);

  program.parse(process.argv);
}

main();
