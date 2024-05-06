import { TableConfig, TableWithColumns } from "../../schema/table";
import { Type } from "../../schema/types";
import { DB } from "../index";
import { Constraint, constraints, numberConstraints } from "./constraints";
import { QueryPromise } from "./promise";
import { Where } from "./types";

export class UpdateQueryBuilder<
  T extends TableConfig<{}>
> extends QueryPromise<void> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _value: T["columns"] = {};
  constructor(db: DB, table: TableWithColumns<T>) {
    super();
    this._db = db;
    this._table = table;
  }
  set(value: {
    [K in keyof T["columns"]]?: T["columns"][K] extends Type<infer T>
      ? T
      : unknown;
  }) {
    this._value = value;
    return this;
  }
  where<Column extends keyof T["columns"]>(
    column: Column,
    constraint: Constraint,
    value: T["columns"][Column] extends Type<infer T> ? T : unknown
  ) {
    return new UpdateQueryWithWhere(
      this._db,
      this._table,
      {
        column,
        constraint,
        value,
      },
      this._value
    );
  }

  async execute() {
    const json = await this._db.getJSON();
    for (const [k, v] of Object.entries(this._value)) {
      const column = (this._table._config.columns as any)[k] as Type;
      if (!column) throw new Error(`Invalid column: ${k}`);
      const result = column.validate(v);
      if (!result.valid)
        throw new Error(`Invalid value: ${v} (${result.error})`);
    }
    json[this._table._config.name].forEach((row: any) =>
      Object.assign(row, this._value)
    );
    await this._db.setJSON(json);
  }
}

class UpdateQueryWithWhere<
  T extends TableConfig<{}>
> extends QueryPromise<void> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _value: T["columns"] = {};
  private _where: Where<T>;
  constructor(
    db: DB,
    table: TableWithColumns<T>,
    where: {
      column: keyof T;
      constraint: Constraint;
      value: any;
    },
    value?: T["columns"]
  ) {
    super();
    this._db = db;
    this._table = table;
    if (value) this._value = value;

    const c = constraints.find((c) => c.symbol === where.constraint);
    if (!c) throw new SyntaxError(`Invalid constraint: ${where.constraint}`);
    if (
      numberConstraints.find((c2) => c2.symbol === c.symbol) &&
      (this._table._config.columns as any)[where.column].name !== "number"
    )
      throw new SyntaxError(`Invalid constraint: ${where.constraint}`);

    const column = (this._table._config.columns as any)[where.column] as Type;
    if (!column) throw new Error(`Invalid column: ${String(where.column)}`);
    const result = column.validate(where.value);
    if (!result.valid)
      throw new Error(`Invalid value: ${where.value} (${result.error})`);

    this._where = {
      column: where.column,
      constraint: c,
      value: where.value,
    };
  }
  set(value: {
    [K in keyof T["columns"]]?: T["columns"][K] extends Type<infer T>
      ? T
      : unknown;
  }) {
    this._value = value;
    return this;
  }

  async execute() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    for (const [k, v] of Object.entries(this._value)) {
      const column = (this._table._config.columns as any)[k] as Type;
      if (!column) throw new Error(`Invalid column: ${k}`);
      const result = column.validate(v);
      if (!result.valid)
        throw new Error(`Invalid value: ${v} (${result.error})`);
    }
    const { column, constraint, value } = this._where;
    const index = table.findIndex((row: any) =>
      constraint.check(value, row[column])
    );
    if (index === -1)
      throw new Error(`No row found with ${String(column)} of ${value}`);
    table[index] = Object.assign(table[index], this._value);
    await this._db.setJSON(json);
  }
}
