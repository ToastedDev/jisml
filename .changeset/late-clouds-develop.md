---
"jisml": patch
---

Add default values for schema types.

```ts
import { string, number, reference } from "jisml";

const users = table("users", {
  id: number().default(1),
  name: string().default("ToastedToast"),
  // you can even use a function to generate the default value
  createdAt: string().default(() => new Date().toISOString()),
});
```
