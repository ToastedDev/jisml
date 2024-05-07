import { exists, readFile, writeFile } from "node:fs/promises";
import { TableConfig, TableWithColumns } from "../schema/table";
import { DBOptions } from "./options";
import { DeleteQueryBuilder } from "./queries/delete";
import { InsertQueryBuilder } from "./queries/insert";
import { SelectQueryBuilder } from "./queries/select";
import { UpdateQueryBuilder } from "./queries/update";

export class DB {
  private _options: DBOptions;
  private _db;
  constructor(options: DBOptions) {
    if (!options) throw new SyntaxError("Options must be provided");
    if (!options.path) throw new SyntaxError("Path must be provided");

    this._options = Object.assign({ autoSave: true }, options);
    this._db =
      this._options.path === ":test:"
        ? {
            users: [],
          }
        : {};
    this.fillDb();
  }
  get path() {
    return this._options.path;
  }
  async getJSON() {
    return this._options.path === ":memory:" || this._options.path === ":test:"
      ? this._db
      : JSON.parse(await readFile(this._options.path, "utf8"));
  }
  async setJSON(json: any) {
    this._db = json;
    if (
      this._options.path !== ":memory:" &&
      this._options.path !== ":test:" &&
      this._options.autoSave
    )
      await this.save();
  }
  async save() {
    await writeFile(this._options.path, JSON.stringify(this._db));
  }
  private async fillDb() {
    if (this._options.path === ":memory:" || this._options.path === ":test:")
      return;
    if (!(await exists(this._options.path)))
      throw new Error(`File does not exist: ${this._options.path}`);

    this._db = await this.getJSON();
  }

  select<T extends TableConfig<{}>>(table: TableWithColumns<T>) {
    return new SelectQueryBuilder(this, table);
  }
  insert<T extends TableConfig<{}>>(table: TableWithColumns<T>) {
    return new InsertQueryBuilder(this, table);
  }
  update<T extends TableConfig<{}>>(table: TableWithColumns<T>) {
    return new UpdateQueryBuilder(this, table);
  }
  delete<T extends TableConfig<{}>>(table: TableWithColumns<T>) {
    return new DeleteQueryBuilder(this, table);
  }
}

export const jsml = (options: DBOptions) => new DB(options);
