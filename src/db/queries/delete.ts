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
    return new DeleteQueryWithWhere(this._db, this._table, {
      column,
      constraint,
      value,
    });
  }

  async execute() {
    const json = await this._db.getJSON();
    json[this._table._config.name] = [];
    await this._db.setJSON(json);
  }
}

class DeleteQueryWithWhere<
  T extends TableConfig<{}>
> extends QueryPromise<void> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _where: {
    column: keyof T;
    constraint: (typeof constraints)[number];
    value: any;
  };

  constructor(
    db: DB,
    table: TableWithColumns<T>,
    where: {
      column: keyof T;
      constraint: Constraint;
      value: any;
    }
  ) {
    super();
    this._db = db;
    this._table = table;

    const c = constraints.find((c) => c.symbol === where.constraint);
    if (!c) throw new SyntaxError(`Invalid constraint: ${where.constraint}`);
    if (
      numberConstraints.find((c2) => c2.symbol === c.symbol) &&
      (this._table._config.columns as any)[where.column].name !== "number"
    )
      throw new SyntaxError(`Invalid constraint: ${where.constraint}`);
    this._where = {
      column: where.column,
      constraint: c,
      value: where.value,
    };
  }

  async execute() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    const { column, constraint, value } = this._where;
    const index = table.findIndex((row: any) =>
      constraint.check(value, row[column])
    );
    if (index === -1)
      throw new Error(`No row found with ${String(column)} of ${value}`);
    table.splice(index, 1);
    await this._db.setJSON(json);
  }
}
