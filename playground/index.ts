import { jsml } from "../src/db/index";
import { table } from "../src/schema/table";
import { number, string } from "../src/schema/types";
import { join } from "node:path";

const db = jsml({ path: join(__dirname, "db.json") });

const users = table("users", {
  id: number(),
  name: string(),
});

async function main() {
  // select first
  const user = await db.select(users).where("id", "=", 1).first();
  console.log(user);

  // select all
  const allUsers = await db.select(users).all();
  console.log(allUsers);
}

main();
