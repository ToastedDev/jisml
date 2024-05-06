import { Command } from "commander";
import { getConfig } from "../utils/config";
import { logger } from "../utils/logger";
import createJiti from "jiti";
import { Table, TableConfig } from "../../schema/table";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import inquirer from "inquirer";

const keys = (x: any) =>
  Object.getOwnPropertyNames(x).concat(
    Object.getOwnPropertyNames(x?.__proto__)
  );

const classToObject = (clss: any) =>
  keys(clss ?? {})
    .filter((key) => key !== "__esModule")
    .reduce((object, key) => {
      const [val, arr] = [clss[key], Array.isArray(clss[key])];
      (object as any)[key] = arr ? val.map(classToObject) : val;
      return object;
    }, {});

function getMissingKeys(obj1: any, obj2: any) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const missingKeys = keys1.filter((key) => !keys2.includes(key));
  return missingKeys;
}

export const pushCommand = new Command()
  .name("push")
  .option("-s, --schemaFile <schema file>", "A schema file")
  .option("-db, --databaseFile <database file>", "A database file")
  .action(async (flags) => {
    let { schemaFile, databaseFile } = flags;

    const config = await getConfig();
    if (!schemaFile) {
      if (!config?.schemaFile) {
        logger.error(
          "No schema file specified. Specify a `schemaFile` in `jisml.config.ts` or as an argument."
        );
        process.exit(1);
      }
      schemaFile = config.schemaFile;
    }
    if (!databaseFile) {
      if (!config?.databaseFile) {
        logger.error(
          "No database file specified. Specify a `databaseFile` in `jisml.config.ts` or as an argument."
        );
        process.exit(1);
      }
      databaseFile = config.databaseFile;
    }

    const jiti = createJiti(undefined as unknown as string, {
      interopDefault: true,
      requireCache: false,
      esmResolve: true,
      extensions: [".js", ".ts"],
    });

    let db = JSON.parse(
      await readFile(join(process.cwd(), databaseFile), "utf8")
    );
    if (!db) db = {};

    const schemaFilePath = jiti.resolve(schemaFile, { paths: [process.cwd()] });
    const exports = jiti(schemaFilePath);
    const schema: Record<string, Table<TableConfig<{}>>> = classToObject(
      exports
    );

    const missingKeys = getMissingKeys(db, schema);
    if (missingKeys.length) {
      for (const key of missingKeys) {
        const { shouldDelete } = await inquirer.prompt<{
          shouldDelete: boolean;
        }>([
          {
            type: "confirm",
            name: "shouldDelete",
            message: `Delete table \`${key}\`? This will cause data loss.`,
          },
        ]);

        if (shouldDelete) {
          delete db[key];
        }
      }
    }

    for (const table of Object.values(schema)) {
      if (!db[table._config.name]) db[table._config.name] = [];
      const firstValue = db[table._config.name][0];
      if (!firstValue) continue;
      const missingKeys = getMissingKeys(firstValue, table._config.columns);
      if (missingKeys.length) {
        for (const key of missingKeys) {
          const { shouldDelete } = await inquirer.prompt<{
            shouldDelete: boolean;
          }>([
            {
              type: "confirm",
              name: "shouldDelete",
              message: `Remove column \`${key}\` from all values? This will cause data loss.`,
            },
          ]);

          if (shouldDelete) {
            for (const value of db[table._config.name]) {
              delete value[key];
            }
          }
        }
      }
    }

    await writeFile(
      join(process.cwd(), databaseFile),
      JSON.stringify(db, null, 2)
    );
  });
