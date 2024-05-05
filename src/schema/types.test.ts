import { expect, test } from "bun:test";
import { number, string } from "./types";

test("Types are created", () => {
  const stringType = string();
  const numberType = number();
  expect(stringType.name).toBe("string");
  expect(numberType.name).toBe("number");
});

test("String type allows string", () => {
  const stringType = string();
  const result = stringType.validate("hello") as any;
  expect(result.valid).toBe(true);
  expect(result.result).toBe("hello");
});

test("String type disallows non-strings", () => {
  const stringType = string();
  const result = stringType.validate(1) as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Value must be a string");
});

test("Number type allows numbers", () => {
  const numberType = number();
  const result = numberType.validate(1) as any;
  expect(result.valid).toBe(true);
  expect(result.result).toBe(1);
});

test("Number type disallows non-numbers", () => {
  const numberType = number();
  const result = numberType.validate("hello") as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Value must be a number");
});

test("Number type disallows NaN", () => {
  const numberType = number();
  const result = numberType.validate(NaN) as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Value must be a number");
});
