import { Command } from "commander";
import { getConfig } from "../utils/config";
import { logger } from "../utils/logger";
import readline from "node:readline";
import { getVersion } from "../utils/get-version";
import { join } from "node:path";
import { readFile, exists } from "node:fs/promises";

export const evalDb = (code: string, db: any, dbPath?: string) => {
  return new Promise((resolve, reject) => {
    try {
      const result = eval(`
        let baseDb = ${JSON.stringify(db)};

        const validators = {
          get(target, key) {
            if (typeof target[key] === 'object' && target[key] !== null) {
              return new Proxy(target[key], validators)
            } else {
              return target[key];
            }
          },
          async set(target, prop, val) {
            target[prop] = val;

            if(${typeof dbPath} !== "undefined") {
              const { writeFile } = await import("node:fs/promises"); 
              await writeFile("${dbPath}", JSON.stringify(baseDb, null, 2));
            }
            
            return true;
          }
        }

        const db = new Proxy(baseDb, validators);

        ${code}
      `);
      return resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

export const mainCommandAction = async function (
  this: Command,
  flags: { databaseFile?: string }
) {
  let { databaseFile } = flags;

  const config = await getConfig();
  if (!databaseFile) {
    if (!config?.databaseFile) {
      logger.error(
        "No database file specified. Specify a `databaseFile` in `jisml.config.ts` or as an argument.\n"
      );
      this.help();
    }
    databaseFile = config.databaseFile;
  }

  const dbPath = join(process.cwd(), databaseFile);
  const dbBasename = databaseFile.split(/(\\|\/)/g).pop();

  if (!(await exists(dbPath))) {
    logger.error(`File does not exist: ${dbPath}`);
    process.exit(1);
  }

  const db = JSON.parse(await readFile(dbPath, "utf8"));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    tabSize: 4,
    prompt: `${dbBasename} > `,
  });

  process.on("exit", () => {
    rl.close();
  });

  console.log(`jisml repl v${await getVersion()}`);

  rl.on("line", async (line) => {
    line = line.trim();
    if (!line) return rl.prompt();
    if (line[0] === ".") {
      const replCmd = line.split(/\s+/g);
      switch (replCmd[0]) {
        case ".exit":
          {
            rl.close();
          }
          break;
      }
    } else {
      const evaled = await evalDb(line, db, dbPath);
      console.log(evaled);
      rl.prompt();
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });

  rl.prompt();
};
