import { TableConfig, TableWithColumns } from "../../schema/table";
import { Type } from "../../schema/types";
import { DB } from "../index";
import { Constraint, constraints, numberConstraints } from "./constraints";
import { Where } from "./types";

export class SelectQueryBuilder<T extends TableConfig<{}>> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  constructor(db: DB, table: TableWithColumns<T>) {
    this._db = db;
    this._table = table;
  }
  where<Column extends keyof T["columns"]>(
    column: Column,
    constraint: Constraint,
    value: T["columns"][Column] extends Type<infer T> ? T : unknown
  ) {
    return new SelectQueryWithWhere(this._db, this._table, {
      column,
      constraint,
      value,
    });
  }

  async first(): Promise<
    | {
        [K in keyof T["columns"]]: T["columns"][K] extends Type<infer T>
          ? T
          : unknown;
      }
    | null
  > {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    return table[0];
  }
  async all(): Promise<
    | {
        [K in keyof T["columns"]]: T["columns"][K] extends Type<infer T>
          ? T
          : unknown;
      }[]
  > {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    return table;
  }
}

class SelectQueryWithWhere<T extends TableConfig<{}>> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _where: Where<T>;
  constructor(
    db: DB,
    table: TableWithColumns<T>,
    where: {
      column: keyof T["columns"];
      constraint: Constraint;
      value: any;
    }
  ) {
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

  async first(): Promise<
    | {
        [K in keyof T["columns"]]: T["columns"][K] extends Type<infer T>
          ? T
          : unknown;
      }
    | null
  > {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    const { column, constraint, value } = this._where;
    const result = table.find((row: any) =>
      constraint.check(value, row[column])
    );
    if (!result) return null;
    return result;
  }
  async all(): Promise<
    | {
        [K in keyof T["columns"]]: T["columns"][K] extends Type<infer T>
          ? T
          : unknown;
      }[]
  > {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    const { column, constraint, value } = this._where;
    const results = table.filter((row: any) =>
      constraint.check(value, row[column])
    );
    if (!results?.length) return [];
    return results;
  }
}
