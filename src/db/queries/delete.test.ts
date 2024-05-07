import { expect, test, beforeAll, mock } from "bun:test";
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

beforeAll(async () => {
  await db
    .insert(users)
    .values({ id: 1, name: "ToastedToast" }, { id: 2, name: "RoastedRoast" });
});

test("Delete one", async () => {
  await db.delete(users).where("id", "=", 1);
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual(null);
});

test("Delete all", async () => {
  await db.delete(users);
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual(null);
});

test("Delete where clause disallows invalid values", async () => {
  const t = async () => {
    // @ts-expect-error
    await db.delete(users).where("id", "=", "test");
  };
  expect(t).toThrow();
});
