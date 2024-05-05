export const numberConstraints = [
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

export const constraints = [
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

export type Constraint = (typeof constraints)[number]["symbol"];
