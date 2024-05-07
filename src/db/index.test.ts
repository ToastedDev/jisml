import { expect, test } from "bun:test";
import { jsml } from ".";

test("Database can be created", async () => {
  const db = jsml({ path: ":memory:" });
  expect(await db.getJSON()).toEqual({});
});

test("Database can be updated", async () => {
  const db = jsml({ path: ":memory:" });
  db.setJSON({ users: [{ name: "John" }] });
  expect(await db.getJSON()).toEqual({ users: [{ name: "John" }] });
});
