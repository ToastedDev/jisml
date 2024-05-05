import { TableConfig, TableWithColumns } from "../../schema/table";
import { Type } from "../../schema/types";
import { DB } from "../index";
import { Constraint, constraints, numberConstraints } from "./constraints";
import { QueryPromise } from "./promise";

export class DeleteQueryBuilder<
  T extends TableConfig<{}>
> extends QueryPromise<void> {
  private _db: DB;
  private _table: TableWithColumns<T>;
  private _where?: {
    column: keyof T;
    constraint: (typeof constraints)[number];
    value: any;
  };
  constructor(db: DB, table: TableWithColumns<T>) {
    super();
    this._db = db;
    this._table = table;
  }
  where<Column extends keyof T["columns"]>(
    column: Column,
    constraint: Constraint,
    value: T["columns"][Column] extends Type<infer T> ? T : unknown
  ) {
    const c = constraints.find((c) => c.symbol === constraint);
    if (!c) throw new SyntaxError(`Invalid constraint: ${constraint}`);
    if (
      numberConstraints.find((c2) => c2.symbol === c.symbol) &&
      (this._table._config.columns as any)[column].name !== "number"
    )
      throw new SyntaxError(`Invalid constraint: ${constraint}`);
    this._where = {
      column,
      constraint: c,
      value,
    };
    return this;
  }

  async execute() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    if (this._where) {
      const { column, constraint, value } = this._where;
      const index = table.findIndex((row: any) =>
        constraint.check(value, row[column])
      );
      if (index === -1)
        throw new Error(`No row found with ${String(column)} of ${value}`);
      table.splice(index, 1);
    } else {
      json[this._table._config.name] = [];
    }
    await this._db.setJSON(json);
  }
}
