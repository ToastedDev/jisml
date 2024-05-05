import { table } from "../src/schema/table";
import { string } from "../src/schema/types";

export const users = table("users", {
  id: string(),
  name: string(),
  email: string(),
});
