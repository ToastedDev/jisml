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
  column: Column | { name: string; type: Column }
) => {
  if (column instanceof Type) {
    column.reference = true;
    return column;
  }
  column.type.reference = true;
  return column.type;
};
