import { loadConfig } from "c12";

interface Config {
  /** A schema file */
  schemaFile: string;
  /** A database file */
  databaseFile: string;
}

export async function getConfig() {
  const { config } = await loadConfig<Config>({
    name: "jisml",
    rcFile: false,
    globalRc: false,
    dotenv: false,
  });
  if (!config) return null;
  if (!Object.keys(config).length) return null;
  return config;
}

export const defineConfig = (config: Config) => config;
