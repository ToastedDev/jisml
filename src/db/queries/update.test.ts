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

test("Update one", async () => {
  await db.update(users).set({ name: "Updated" }).where("id", "=", 1);
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual({ id: 1, name: "Updated" });
});

test("Update all", async () => {
  await db.update(users).set({ name: "Updated" });
  const user1 = await db.select(users).where("id", "=", 1).first();
  const user2 = await db.select(users).where("id", "=", 2).first();
  expect(user1).toEqual({ id: 1, name: "Updated" });
  expect(user2).toEqual({ id: 2, name: "Updated" });
});

test("Update disallows invalid values", async () => {
  const t = async () => {
    // @ts-expect-error
    await db.update(users).set({ name: 1 }).where("id", "=", 1);
  };
  expect(t).toThrow();
});

test("Update where clause disallows invalid values", async () => {
  const t = async () => {
    await db
      .update(users)
      .set({ name: "ToastedToast" })
      // @ts-expect-error
      .where("id", "=", "test");
  };
  expect(t).toThrow();
});
