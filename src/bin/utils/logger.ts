import chalk from "chalk";

export const logger = {
  error: (...data: any[]) => {
    console.error(chalk.red("x"), ...data);
  },
};
