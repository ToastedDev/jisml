import { expect, test, beforeAll } from "bun:test";
import { table } from "../../schema/table";
import { number, string } from "../../schema/types";
import { jsml } from "../index";

const db = jsml({ path: ":test:" });
const users = table("users", {
  id: number(),
  name: string(),
});

beforeAll(async () => {
  await db
    .insert(users)
    .values({ id: 1, name: "ToastedToast" }, { id: 2, name: "RoastedRoast" });
});

test("Delete one", async () => {
  await db.delete(users).where("id", "=", 1).execute();
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual(null);
});

test("Delete all", async () => {
  await db.delete(users).execute();
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual(null);
});
