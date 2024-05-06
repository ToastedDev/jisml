import { Command } from "commander";
import { getConfig } from "../utils/config";
import { logger } from "../utils/logger";
import createJiti from "jiti";
import { Table, TableConfig } from "../../schema/table";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";

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

    const schemaFilePath = jiti.resolve(schemaFile, { paths: [process.cwd()] });
    const exports = jiti(schemaFilePath);
    const schema: Record<string, Table<TableConfig<{}>>> = classToObject(
      exports
    );

    const db: Record<string, any> = {};

    for (const table of Object.values(schema)) {
      if (!db[table._config.name]) db[table._config.name] = [];
    }

    await writeFile(
      join(process.cwd(), databaseFile),
      JSON.stringify(db, null, 2)
    );
  });
