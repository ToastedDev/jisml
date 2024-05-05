import { exists } from "node:fs/promises";
import { DBOptions } from "./options";

class DB {
  private _options: DBOptions;
  constructor(options: DBOptions) {
    if (!options) throw new SyntaxError("Options must be provided");
    if (!options.path) throw new SyntaxError("Path must be provided");

    this._options = Object.assign({ autoSave: true }, options);
    this.checkPath();
  }
  private async checkPath() {
    if (!(await exists(this._options.path)))
      throw new Error(`File does not exist: ${this._options.path}`);
  }
}

export const jsml = (options: DBOptions) => new DB(options);
