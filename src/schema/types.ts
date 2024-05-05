type ValidatorResult<T> =
  | {
      valid: true;
      result: T;
    }
  | {
      valid: false;
      error: string;
    };

export class Type<
  T = any,
  O extends Record<string, any> = Record<string, any>
> {
  private _name: string;
  private _validator: (value: unknown) => ValidatorResult<T>;
  private _options?: O;
  constructor(
    name: string,
    validator: (this: Type<T, O>, value: unknown) => ValidatorResult<T>,
    options?: O,
    public reference: boolean = false
  ) {
    this._name = name;
    this._validator = validator.bind(this);
    this._options = options;
  }
  get name() {
    return this._name;
  }
  get options() {
    return this._options;
  }
  isReference() {
    return this.reference;
  }
  validate(value: unknown): ValidatorResult<T> {
    return this._validator(value);
  }
}

const typeGenerator =
  <T, O extends Record<string, any> = Record<string, any>>(
    typeName: string,
    validator: (this: Type<T, O>, value: unknown) => ValidatorResult<T>
  ) =>
  (options?: O) =>
    new Type<T, O>(typeName, validator, options);

export const string = typeGenerator<
  string,
  {
    length: number;
  }
>("string", function (value) {
  if (typeof value === "string") {
    if (this.options?.length) {
      if (value.length < this.options.length) {
        return { valid: true, result: value };
      } else {
        return {
          valid: false,
          error: `Value must be less than ${this.options.length} characters`,
        };
      }
    }
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

export const reference = <Column extends Type>(column: Column) => {
  column.reference = true;
  return column;
};
