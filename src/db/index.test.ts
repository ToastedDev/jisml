import { expect, test, mock } from "bun:test";
import { jsml } from ".";

let mockDb = JSON.stringify({});

mock.module("fs/promises", () => ({
  readFile: async () => mockDb,
  writeFile: async (_path: string, data: string) => (mockDb = data),
  exists: () => true,
}));

test("Database can be created", async () => {
  const db = jsml({ path: "./db.json" });
  expect(await db.getJSON()).toEqual({});
});

test("Database can be updated", async () => {
  const db = jsml({ path: "./db.json" });
  db.setJSON({ users: [{ name: "John" }] });
  expect(await db.getJSON()).toEqual({ users: [{ name: "John" }] });
});
