import { reference, string, Type } from "./types";

interface TableConfig<T extends Record<string, Type>> {
  name: string;
  columns: {
    [K in keyof T]: {
      name: K;
      type: T[K];
    };
  };
}

class Table<T extends TableConfig<{}>> {
  private _config: T;
  constructor(config: T) {
    this._config = config;
  }
  get name() {
    return this._config.name;
  }
}

type TableWithColumns<T extends TableConfig<{}>> = Table<T> & {
  [K in keyof T["columns"]]: {
    name: K;
    type: T["columns"][K];
  };
};

export const table = <
  Name extends string,
  Columns extends Record<string, Type>
>(
  name: Name,
  columns: Columns
): TableWithColumns<{
  name: Name;
  columns: Columns;
}> => {
  const rawTable = new Table<{
    name: Name;
    columns: Columns;
  }>({
    name,
    columns,
  });

  const builtColumns = Object.fromEntries(
    Object.entries(columns).map(([key, type]) => [
      key,
      {
        name: key,
        type,
      },
    ])
  );

  return Object.assign(rawTable, builtColumns as any);
};
