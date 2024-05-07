import { expect, test } from "bun:test";
import { array, number, reference, string } from "./types";

test("Types are created", () => {
  const stringType = string();
  const numberType = number();
  const arrayType = array(string());
  const referenceType = reference(stringType);
  expect(stringType.name).toBe("string");
  expect(numberType.name).toBe("number");
  expect(arrayType.name).toBe("array");
  expect(referenceType.name).toBe("string");
});

test("Types can have default values", () => {
  const stringType = string().default("hello");
  const numberType = number().default(1);
  const arrayType = array(string()).default(["hello"]);
  const referenceType = reference(stringType);
  expect(stringType.defaultValue).toBe("hello");
  expect(numberType.defaultValue).toBe(1);
  expect(arrayType.defaultValue).toEqual(["hello"]);
  expect(referenceType.defaultValue).toBe("hello");
});

test("Types can have default values that are functions", () => {
  const stringType = string().defaultFn(() => "hello");
  const numberType = number().defaultFn(() => 1);
  const arrayType = array(string()).defaultFn(() => ["hello"]);
  const referenceType = reference(stringType);
  expect(stringType.defaultValue).toBe("hello");
  expect(numberType.defaultValue).toBe(1);
  expect(arrayType.defaultValue).toEqual(["hello"]);
  expect(referenceType.defaultValue).toBe("hello");
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

test("Array type allows arrays", () => {
  const arrayType = array(string());
  const result = arrayType.validate(["hello"]) as any;
  expect(result.valid).toBe(true);
  expect(result.result).toEqual(["hello"]);
});

test("Array type can be created with an array type", () => {
  const arrayType = array(array(string()));
  const result = arrayType.validate([["hello"]]) as any;
  expect(result.valid).toBe(true);
  expect(result.result).toEqual([["hello"]]);
});

test("Array type disallows non-arrays", () => {
  const arrayType = array(string());
  const result = arrayType.validate("hello") as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Value must be an array");
});

test("Array type disallows arrays with incorrect types", () => {
  const arrayType = array(string());
  const result = arrayType.validate([1]) as any;
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Invalid type");
});

test("Reference type has a reference", () => {
  const stringType = string();
  const referenceType = reference(stringType);
  expect(referenceType.name).toBe("string");
  expect(referenceType.reference).toBe(true);
});

test("Reference type allows the referenced type", () => {
  const stringType = string();
  const referenceType = reference(stringType);
  const result = referenceType.validate("hello") as any;
  expect(result.valid).toBe(true);
  expect(result.result).toBe("hello");
});
