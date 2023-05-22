
export const LogLevels = {
  error: "error",
  warn: "warn",
  log: "log",
  debug: "debug",
  verbose: "verbose",
} as const;

export const LogLevelNumbers = {
  [LogLevels.error]: 0,
  [LogLevels.warn]: 1,
  [LogLevels.log]: 2,
  [LogLevels.debug]: 3,
  [LogLevels.verbose]: 4,
};

export type LogLevel =
  | "verbose"
  | "debug"
  | "log"
  | "warn"
  | "error"
  ;
