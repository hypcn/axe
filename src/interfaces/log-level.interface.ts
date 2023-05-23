
/** Log level definitions */
export const LogLevels = {
  none: "none",
  error: "error",
  warn: "warn",
  log: "log",
  debug: "debug",
  verbose: "verbose",
} as const;

/** Log levels as numbers of importance comparison */
export const LogLevelNumbers = {
  [LogLevels.none]: -1,
  [LogLevels.error]: 0,
  [LogLevels.warn]: 1,
  [LogLevels.log]: 2,
  [LogLevels.debug]: 3,
  [LogLevels.verbose]: 4,
};

/** Log levels as a union type */
export type LogLevel = keyof typeof LogLevels;

/** Uppercase log level names */
export const LogLevelName = {
  [LogLevels.none]:    "NONE",
  [LogLevels.error]:   "ERROR",
  [LogLevels.warn]:    "WARN",
  [LogLevels.log]:     "LOG",
  [LogLevels.debug]:   "DEBUG",
  [LogLevels.verbose]: "VERBOSE",
} as const;

/** Lowercase log level names */
export const LogLevelNameLower = {
  [LogLevels.none]:    "none",
  [LogLevels.error]:   "error",
  [LogLevels.warn]:    "warn",
  [LogLevels.log]:     "log",
  [LogLevels.debug]:   "debug",
  [LogLevels.verbose]: "verbose",
} as const;

/** Uppercase log level names aligned to the left */
export const LogLevelNameLeft = {
  [LogLevels.none]:    "NONE ",
  [LogLevels.error]:   "ERROR",
  [LogLevels.warn]:    "WARN ",
  [LogLevels.log]:     "LOG  ",
  [LogLevels.debug]:   "DEBUG",
  [LogLevels.verbose]: "VERBOSE",
} as const;

/** Uppercase log level names aligned to the right */
export const LogLevelNameRight = {
  [LogLevels.none]:    " NONE",
  [LogLevels.error]:   "ERROR",
  [LogLevels.warn]:    " WARN",
  [LogLevels.log]:     "  LOG",
  [LogLevels.debug]:   "DEBUG",
  [LogLevels.verbose]: "VERBOSE",
} as const;
