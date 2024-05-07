import { expect, test } from "bun:test";
import { evalDb } from "./main";

test("Eval gets data", async () => {
  const db = {
    users: [
      {
        id: 1,
        name: "ToastedToast",
      },
    ],
  };

  const evaled = await evalDb("db.users[0].name", db);
  expect(evaled).toBe("ToastedToast");
});

test("Eval sets data", async () => {
  const db = {
    users: [
      {
        id: 1,
        name: "ToastedToast",
      },
    ],
  };

  const evaled = await evalDb(
    'db.users[0].name = "Updated"; db.users[0].name;',
    db
  );
  expect(evaled).toBe("Updated");
});
