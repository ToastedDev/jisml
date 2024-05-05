import { expect, test } from "bun:test";
import { number, reference, string } from "./types";

test("Types are created", () => {
  const stringType = string();
  const numberType = number();
  const referenceType = reference(stringType);
  expect(stringType.name).toBe("string");
  expect(numberType.name).toBe("number");
  expect(referenceType.name).toBe("string");
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

test("String type disallows strings longer than the limit", () => {
  const stringType = string({ length: 3 });
  const result = stringType.validate("hello") as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Value must be less than 3 characters");
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

test("Reference type has a reference", () => {
  const stringType = string();
  const referenceType = reference(stringType);
  expect(referenceType.name).toBe("string");
});

test("Reference type allows the referenced type", () => {
  const stringType = string();
  const referenceType = reference(stringType);
  const result = referenceType.validate("hello") as any;
  expect(result.valid).toBe(true);
  expect(result.result).toBe("hello");
});
