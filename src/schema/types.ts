type ValidatorResult<T> =
  | {
      valid: true;
      result: T;
    }
  | {
      valid: false;
      error: string;
    };

export class Type<T = any> {
  private _name: string;
  private _validator: (value: unknown) => ValidatorResult<T>;
  private _reference: boolean;
  public defaultValue?: T;
  constructor(
    name: string,
    validator: (value: unknown) => ValidatorResult<T>,
    reference: boolean = false
  ) {
    this._name = name;
    this._validator = validator.bind(this);
    this._reference = reference;
  }
  get name() {
    return this._name;
  }
  get reference() {
    return this._reference;
  }
  set reference(reference: boolean) {
    this._reference = reference;
  }
  default(value: T) {
    this.defaultValue = value;
    return this;
  }
  defaultFn(fn: () => T) {
    this.defaultValue = fn();
    return this;
  }
  isReference() {
    return this._reference;
  }
  validate(value: unknown): ValidatorResult<T> {
    return this._validator(value);
  }
}

const typeGenerator =
  <T>(
    typeName: string,
    validator: (this: Type<T>, value: unknown) => ValidatorResult<T>
  ) =>
  () =>
    new Type<T>(typeName, validator);

export const string = (options: { length?: number } = {}) =>
  typeGenerator<string>("string", (value) => {
    if (typeof value === "string") {
      if (options?.length) {
        if (value.length < options.length) {
          return { valid: true, result: value };
        } else {
          return {
            valid: false,
            error: `Value must be less than ${options.length} characters`,
          };
        }
      }
      return { valid: true, result: value };
    }
    return { valid: false, error: "Value must be a string" };
  })();

export const number = typeGenerator<number>("number", (value) => {
  if (typeof value === "number" && !isNaN(value)) {
    return { valid: true, result: value };
  }
  return { valid: false, error: "Value must be a number" };
});

export const boolean = typeGenerator<boolean>("boolean", (value) => {
  if (typeof value === "number") {
    if (!(value === 0 || value === 1)) {
      return { valid: false, error: "Value must be 0 or 1" };
    }
    return { valid: true, result: value === 0 ? false : true };
  }
  if (typeof value === "boolean") {
    return { valid: true, result: value };
  }
  return { valid: false, error: "Value must be a boolean" };
});

export const object = <T extends Record<string, Type>>(type: T) =>
  typeGenerator<{
    [K in keyof T]: T[K] extends Type<infer TypeScriptType>
      ? TypeScriptType
      : never;
  }>("object", (value) => {
    if (typeof value === "object" && value !== null) {
      for (const key of Object.keys(type)) {
        const t = type[key]!;
        if (
          (value as any)[key] === undefined &&
          type.defaultValue !== undefined
        ) {
          (value as any)[key] = type.defaultValue;
        }
        const result = t.validate((value as any)[key]);
        if (!result.valid) {
          return {
            valid: false,
            error: `Invalid value for ${key}: ${result.error}`,
          };
        }
      }
      return { valid: true, result: value as any };
    }
    return { valid: false, error: "Value must be an object" };
  })();

export const array = <T extends Type>(type: T) =>
  typeGenerator<
    T extends Type<infer TypeScriptType> ? TypeScriptType[] : never
  >("array", (value) => {
    if (Array.isArray(value)) {
      if (value.every((val) => type.validate(val).valid)) {
        return { valid: true, result: value as any };
      } else {
        return { valid: false, error: "Invalid type" };
      }
    }
    return { valid: false, error: "Value must be an array" };
  })();

export const reference = <Column extends Type>(
  columnOrType: Column | { name: string; type: Column }
) => {
  if (columnOrType instanceof Type) {
    columnOrType.reference = true;
    return columnOrType;
  }
  columnOrType.type.reference = true;
  return columnOrType.type;
};

export const references = <Column extends Type>(
  columnOrType: Column | { name: string; type: Column }
) => {
  const column =
    columnOrType instanceof Type ? columnOrType : columnOrType.type;
  const newType = array<Column>(reference(columnOrType));
  newType.reference = true;
  if (column.defaultValue && !Array.isArray(column.defaultValue)) {
    newType.defaultValue = [column.defaultValue] as any;
  }
  return newType;
};
