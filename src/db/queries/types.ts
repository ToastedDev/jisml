import { TableConfig } from "../../schema/table";
import { constraints } from "./constraints";

export interface Where<T extends TableConfig<{}>> {
  column: keyof T;
  constraint: (typeof constraints)[number];
  value: any;
}
