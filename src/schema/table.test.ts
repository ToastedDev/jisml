import { expect, test } from "bun:test";
import { table } from "./table";
import { string } from "./types";

test("Table is created", () => {
  const users = table("users", {
    id: string(),
  });
  expect(users.name).toBe("users");
});

test("Table has a column", () => {
  const users = table("users", {
    id: string(),
  });
  expect(users.id.name).toBe("id");
  expect(users.id.type.name).toBe("string");
});
