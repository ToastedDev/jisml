import { expect, test } from "bun:test";
import { table } from "../../schema/table";
import { number, string } from "../../schema/types";
import { jsml } from "../index";

const db = jsml({ path: ":test:" });
const users = table("users", {
  id: number(),
  name: string(),
});

test("Insert one", async () => {
  await db.insert(users).values({ id: 1, name: "ToastedToast" });
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).not.toEqual(null);
});

test("Insert multiple", async () => {
  await db
    .insert(users)
    .values({ id: 1, name: "ToastedToast" }, { id: 2, name: "RoastedRoast" });
  const user1 = await db.select(users).where("id", "=", 1).first();
  const user2 = await db.select(users).where("id", "=", 2).first();
  expect(user1).not.toEqual(null);
  expect(user2).not.toEqual(null);
});