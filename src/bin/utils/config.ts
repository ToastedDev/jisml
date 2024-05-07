import { loadConfig } from "c12";

export interface Config {
  /** A schema file */
  schemaFile: string;
  /** A database file */
  databaseFile: string;
  /**
   * Verbose mode
   * When this is enabled, verbose logs will be written to the console.
   */
  verbose?: boolean;
  /**
   * Strict mode
   * When this is enabled, you will be promoted when doing a destructive action.
   * */
  strict?: boolean;
}

const baseConfig = {
  verbose: true,
  strict: true,
} as Config;

export async function getConfig() {
  const { config } = await loadConfig<Config>({
    name: "jisml",
    rcFile: false,
    globalRc: false,
    dotenv: false,
  });
  if (!config || !Object.keys(config).length) return baseConfig;
  return Object.assign(config, baseConfig);
}

export const defineConfig = (config: Config) => config;
