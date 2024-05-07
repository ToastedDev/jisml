# jisml

## 0.0.2

### Patch Changes

- 4548446: **!!! BREAKING CHANGE !!!** Remove `:memory:` and `:test:` path options.

  If you are using either of these paths, please use a real path instead.

- 124ba69: Fix type error with references.
- 258888b: Export `DBOptions` and `Config` types.
- 0282b46: Add default values for schema types.

  ```ts
  import { string, number, reference } from "jisml";

  const users = table("users", {
    id: number().default(1),
    name: string().default("ToastedToast"),
    // you can even use a function to generate the default value
    createdAt: string().defaultFn(() => new Date().toISOString()),
  });
  ```

- 7bb631d: Add `boolean`, `object`, `array`, `references` and `reference` types

  ```ts
  import { number, array, string } from "jisml";

  const users = table("users", {
    id: number(),
    name: string(),
  });

  const posts = table("posts", {
    id: number(),
    title: string(),
    metadata: object({
      tags: array(string()),
      published: boolean(),
      authors: references(users.id),
    }),
  });
  ```

- 20954f9: Add `jsml` CLI.

  ```sh
  npm install -g jisml # install globally
  jsml --databaseFile="./db.json" # run repl
  jsml push --schemaFile="./schema.json" --databaseFile="./db.json" # push schema to database
  ```

## 0.0.1

### Patch Changes

- 8e864d5: Initial version with basic functionality.
