---
"jisml": patch
---

Add `array` schema type.

```ts
import { array, string } from "jisml";

const posts = table("posts", {
  id: number(),
  title: string(),
  tags: array(string()),
});
```
