---
"jisml": patch
---

Add `boolean`, `object`, `array`, `references` and `reference` types

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
