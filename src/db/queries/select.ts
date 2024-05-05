import { table, TableConfig, TableWithColumns } from "../../schema/table";
import { string, Type } from "../../schema/types";
import { DB } from "../index";

type Constraint = "=";

export class SelectQueryBuilder<T extends TableConfig<{}>> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _where?: {
    column: keyof T;
    constraint: Constraint;
    value: any;
  };
  constructor(db: DB, table: TableWithColumns<T>) {
    this._db = db;
    this._table = table;
  }
  where<Column extends keyof T["columns"]>(
    column: Column,
    constraint: Constraint,
    value: T["columns"][Column] extends Type<infer T> ? T : unknown
  ) {
    this._where = {
      column,
      constraint,
      value,
    };
    return this;
  }

  async first() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    if (this._where) {
      const { column, /* constraint, */ value } = this._where;
      const result = table.find((row: any) => row[column] === value);
      if (!result) return null;
      return result;
    }
    return table[0];
  }

  async all() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    if (this._where) {
      const { column, /* constraint, */ value } = this._where;
      const results = table.filter((row: any) => row[column] === value);
      if (!results?.length) return null;
      return results;
    }
    return table;
  }
}
