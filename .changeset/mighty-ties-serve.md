---
"jisml": patch
---

Add `boolean`, `array`, and `references` schema type.

```ts
import { number, array, string } from "jisml";

const users = table("users", {
  id: number(),
  name: string(),
});

const posts = table("posts", {
  id: number(),
  title: string(),
  tags: array(string()),
  published: boolean(),
  authors: references(users.id),
});
```
