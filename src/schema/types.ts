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
  constructor(name: string, validator: (value: unknown) => ValidatorResult<T>) {
    this._name = name;
    this._validator = validator;
  }
  get name() {
    return this._name;
  }
  validate(value: unknown): ValidatorResult<T> {
    return this._validator(value);
  }
}

const typeGenerator =
  <T>(typeName: string, validator: (value: unknown) => ValidatorResult<T>) =>
  (): Type<T> =>
    new Type<T>(typeName, validator);

export const string = typeGenerator<string>("string", (value) => {
  if (typeof value === "string") {
    return { valid: true, result: value };
  }
  return { valid: false, error: "Value must be a string" };
});

export const number = typeGenerator<number>("number", (value) => {
  if (typeof value === "number" && !isNaN(value)) {
    return { valid: true, result: value };
  }
  return { valid: false, error: "Value must be a number" };
});

export const reference = <Column extends Type>(column: Column) => column;
