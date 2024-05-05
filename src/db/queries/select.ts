import { TableConfig, TableWithColumns } from "../../schema/table";
import { Type } from "../../schema/types";
import { DB } from "../index";

const numberConstraints = [
  {
    symbol: ">",
    check: (value: any, columnValue: any) => {
      return columnValue > value;
    },
  },
  {
    symbol: ">=",
    check: (value: any, columnValue: any) => {
      return columnValue >= value;
    },
  },
  {
    symbol: "<",
    check: (value: any, columnValue: any) => {
      return columnValue <= value;
    },
  },
  {
    symbol: "<=",
    check: (value: any, columnValue: any) => {
      return columnValue <= value;
    },
  },
] as const;

const constraints = [
  {
    symbol: "=",
    check: (value: any, columnValue: any) => {
      return value === columnValue;
    },
  },
  {
    symbol: "!=",
    check: (value: any, columnValue: any) => {
      return value !== columnValue;
    },
  },
  ...numberConstraints,
] as const;

type Constraint = (typeof constraints)[number]["symbol"];

export class SelectQueryBuilder<T extends TableConfig<{}>> {
  private _table: TableWithColumns<T>;
  private _db: DB;
  private _where?: {
    column: keyof T;
    constraint: (typeof constraints)[number];
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

  async first() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    if (this._where) {
      const { column, constraint, value } = this._where;
      const result = table.find((row: any) =>
        constraint.check(value, row[column])
      );
      if (!result) return null;
      return result;
    }
    return table[0];
  }

  async all() {
    const json = await this._db.getJSON();
    const table = json[this._table._config.name];
    if (this._where) {
      const { column, constraint, value } = this._where;
      const results = table.filter((row: any) =>
        constraint.check(value, row[column])
      );
      if (!results?.length) return null;
      return results;
    }
    return table;
  }
}
