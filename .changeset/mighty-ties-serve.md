---
"jisml": patch
---

Add `boolean` and `array` schema type.

```ts
import { number, array, string } from "jisml";

const posts = table("posts", {
  id: number(),
  title: string(),
  tags: array(string()),
  published: boolean(),
});
```
