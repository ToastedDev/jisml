import { exists, readFile } from "node:fs/promises";
import { TableConfig, TableWithColumns } from "../schema/table";
import { DBOptions } from "./options";
import { SelectQueryBuilder } from "./queries/select";

export class DB {
  private _options: DBOptions;
  private _db = {
    users: [
      {
        id: 1,
        name: "ToastedToast",
      },
      {
        id: 2,
        name: "RoastedRoast",
      },
    ],
  };
  constructor(options: DBOptions) {
    if (!options) throw new SyntaxError("Options must be provided");
    if (!options.path) throw new SyntaxError("Path must be provided");

    this._options = Object.assign({ autoSave: true }, options);
    this.checkPath();
  }
  get path() {
    return this._options.path;
  }
  async getJSON() {
    return this._options.path === ":memory:"
      ? this._db
      : JSON.parse(await readFile(this._options.path, "utf8"));
  }
  private async checkPath() {
    if (this._options.path === ":memory:") return;
    if (!(await exists(this._options.path)))
      throw new Error(`File does not exist: ${this._options.path}`);
  }

  select<T extends TableConfig<{}>>(table: TableWithColumns<T>) {
    return new SelectQueryBuilder(this, table);
  }
}

export const jsml = (options: DBOptions) => new DB(options);
