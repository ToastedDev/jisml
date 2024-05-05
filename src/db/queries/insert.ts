import { table, TableConfig, TableWithColumns } from "../../schema/table";
import { number, string, Type } from "../../schema/types";
import { DB } from "../index";
import { QueryPromise } from "./promise";

export class InsertQueryBuilder<
  T extends TableConfig<{}>
> extends QueryPromise<void> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _values: T["columns"][] = [];
  constructor(db: DB, table: TableWithColumns<T>) {
    super();
    this._db = db;
    this._table = table;
  }
  values(
    ...values: {
      [K in keyof T["columns"]]: T["columns"][K] extends Type<infer T>
        ? T
        : unknown;
    }[]
  ) {
    this._values = values;
    return this;
  }
  async execute() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    // TODO: validate values
    table.push(...this._values);
    await this._db.setJSON(json);
  }
}
