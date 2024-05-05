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

test("Select first", async () => {
  const user = await db.select(users).first();
  expect(user.id).toBe(1);
});

test("Select first with = constraint", async () => {
  const user = await db.select(users).where("id", "=", 1).first();
  expect(user.id).toBe(1);
});

test("Select first with != constraint", async () => {
  const user = await db.select(users).where("id", "!=", 1).first();
  expect(user.id).toBe(2);
});

test("Select first with > constraint", async () => {
  const user = await db.select(users).where("id", ">", 1).first();
  expect(user.id).toBeGreaterThan(1);
});

test("Select first with >= constraint", async () => {
  const user = await db.select(users).where("id", ">=", 1).first();
  expect(user.id).toBeGreaterThanOrEqual(1);
});

test("Select first with < constraint", async () => {
  const user = await db.select(users).where("id", "<", 2).first();
  expect(user.id).toBeLessThan(2);
});

test("Select first with <= constraint", async () => {
  const user = await db.select(users).where("id", ">=", 2).first();
  expect(user.id).toBeLessThanOrEqual(2);
});

test("Select all", async () => {
  const allUsers = await db.select(users).all();
  expect(allUsers[0].id).toBe(1);
});

test("Select all with = constraint", async () => {
  const allUsers = await db.select(users).where("id", "=", 1).all();
  expect(allUsers[0].id).toBe(1);
});

test("Select all with != constraint", async () => {
  const allUsers = await db.select(users).where("id", "!=", 1).all();
  expect(allUsers[0].id).toBe(2);
});

test("Select all with > constraint", async () => {
  const allUsers = await db.select(users).where("id", ">", 1).all();
  expect(allUsers[0].id).toBeGreaterThan(1);
});

test("Select all with >= constraint", async () => {
  const allUsers = await db.select(users).where("id", ">=", 1).all();
  expect(allUsers[0].id).toBeGreaterThanOrEqual(1);
});

test("Select all with < constraint", async () => {
  const allUsers = await db.select(users).where("id", "<", 2).all();
  expect(allUsers[0].id).toBeLessThan(2);
});

test("Select all with <= constraint", async () => {
  const allUsers = await db.select(users).where("id", ">=", 2).all();
  expect(allUsers[0].id).toBeLessThanOrEqual(2);
});
