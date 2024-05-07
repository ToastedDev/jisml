import { expect, test, mock } from "bun:test";
import { table } from "../../schema/table";
import { number, string } from "../../schema/types";
import { jsml } from "../index";

let mockDb = JSON.stringify({ users: [] });

mock.module("fs/promises", () => ({
  readFile: async () => mockDb,
  writeFile: async (_path: string, data: string) => (mockDb = data),
  exists: () => true,
}));

const db = jsml({ path: "./db.json" });
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

test("Insert disallows invalid values", async () => {
  const t = async () => {
    // @ts-expect-error
    await db.insert(users).values({ id: "test", name: "ToastedToast" });
  };
  expect(t).toThrow();
});
