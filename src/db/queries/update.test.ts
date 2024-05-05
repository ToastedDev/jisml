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

test("Update one", async () => {
  await db.update(users).set({ name: "Updated" }).where("id", "=", 1).execute();
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user).toEqual({ id: 1, name: "Updated" });
});
