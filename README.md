# Axe

[![npm (scoped)](https://img.shields.io/npm/v/@hypericon/axe)](https://www.npmjs.com/package/@hypericon/axe)

A simple tool for logging. (Ha ha.)

Includes multiple built-in log sinks, with a simple API for adding arbitrary log handers

- Console ([usage](#ConsoleSink))
- File ([usage](#FileSink))
- Hypertable ([usage](#HypertableSink)) ([website](https://hypertable.co.uk))
- RxJS observable ([usage](#ObservableSink))
- Webhook ([usage](#WebhookSink))
- Custom sink ([usage](#LogSink))

Includes fine-grained filtering of logs by log level

- Set minimum log level handled by each log sink
- Override settings for individual logger instances
- Create separate manager instances with their own sinks for even more options

# Installation

Install with NPM:

```bash
npm install @hypericon/axe
```

Includes type definitions.

# Example

Example Typescript usage:

```typescript
import { logMgr, ConsoleSink, CONSOLE_SINK, LogLevels, Logger, LogManager } from "@hypericon/axe";

const logger = new Logger("MyLogger");

logger.log("a log");
logger.warn("a warning");
logger.error("an error");
logger.log("log primitives and objects", [1, 2, 3], { an: "object" }, undefined);

// Additional loggers can be created with separate contexts
const anotherLogger = new Logger("Another Logger");
anotherLogger.log("This logger has the context 'Another Logger'");

// Update the log level filter for the default console sink.
// Sinks are identified by their unique "name", the default console sink's name is exported
// from the package.
logMgr.setSinkFilter(CONSOLE_SINK, LogLevels.verbose);
logMgr.setSinkFilter("Console", "verbose"); // <- this is equivalent, but less robust to change
logger.verbose("verbose logs are ignored by default, but this is displayed.");

// Additional sinks can be added.
// (there is no good reason to have two console sinks, this is just an example)
const newConsoleSink = "Console2";
logMgr.addSink(new ConsoleSink({
  name: newConsoleSink,
  logLevel: LogLevels.log,
}));

// Separate sinks can have different log filters:
logMgr.setSinkFilter(newConsoleSink, LogLevels.warn);
// The current sink  log level filters can be read:
logMgr.readSinkFilters(); // { 'Console': 'verbose', 'Console2': 'warn' }
// This is useful for editing which log levels are logged where at runtime

// Separate manager instances can be created,
// with their own separate sink instances and log level filters
const newManager = new LogManager({ withDefaultConsoleSink: true });
const logger2 = newManager.newLogger("Logger 2");
logger2.log("This logger's manager 'newManager' is separate from 'logMgr' above.");
logger2.log("This allows them to configure their sinks and common filters separately.");

// Note: the "logMgr" import from the package is simply a prebuilt instance of
// `LogManager` with the default console sink.
```

# Usage

## LogLevel

The type `LogLevel` and const `LogLevels` define the log levels used in Axe.

```typescript
import { LogLevel, LogLevels } from "@hypericon/axe";

// LogLevel is defined like this:
type LogLevel = "error" | "warn" | "log" | "debug" | "verbose" | "none";

// LogLevels is defined like this:
const LogLevels = {
  error: "error",
  warn: "warn",
  log: "log",
  debug: "debug",
  verbose: "verbose",
  none: "none",
} as const;
```

## Logger

`Logger` is the main point of contact for the library.

```typescript
import { Logger, LogLevel } from "@hypericon/axe";

// Create a new Logger with the given context
const logger = new Logger(context?: string);

// Log anything with one of the 5 log levels
logger.error(...msgs: any[]);
logger.warn(...msgs: any[]);
logger.log(...msgs: any[]);
logger.debug(...msgs: any[]);
logger.verbose(...msgs: any[]);

// Logger instances can be configured to override the logFilter settings of `LogSink`s in their manager

// Read all of the logger's filter settings (may be empty)
logger.sinkFilter.read(): { [sinkName: string]: LogLevel };
// Get the logger's filter set on the named sink (may be undefined)
logger.sinkFilter.get(sinkName: string): LogLevel | undefined;
// Set a log filter on the named sink
logger.sinkFilter.set(sinkName: string, logLevel: LogLevel): void;
// Remove the log filter set on the named sink
logger.sinkFilter.remove(sinkName: string): void;
// Remove all log filters set on the logger
logger.sinkFilter.clear(): void;
```

## LogManager

`LogManager` stores instances of `Logger` and `LogSink`, and handles formatting and filtering logged messages.

Every `Logger` is associated with one `LogManager`.

A default instance named `logMgr` is exported from the library. `Logger`s created using the `new Logger(...)` constructor are associated with this instance.

```typescript
import { logMgr, LogManager, LogSink } from "@hypericon/axe";

// `logMgr` is the default `LogManager` instance.
const logger1 = new Logger("1"); // manager -> `logMgr`

// Create a separate manager instance
const anotherManager = new LogManager();
const logger2 = anotherManager.createLogger("2"); // manager -> `anotherManager`

// Alternatively, create a Logger with the default manager, then move it to another manager
const logger3 = new Logger("3");
anotherManager.addLogger(logger3); // moves the logger from the default `logMgr` to the new manager

// `LogSink`s are managed in `LogManager` instances separately
logMgr.addSink(...);
anotherManager.addSink(...);

// Find, add, and remove `LogSink`s and filters
logMgr.findSinkByName(name: string): LogSink | undefined;
logMgr.findSink<T extends LogSink>(sinkClass: Class<T>): T | undefined;
logMgr.addSink(sink: LogSink): void;
logMgr.removeSinkByName(name: string): void;
logMgr.removeSink(sink: LogSink): void;
logMgr.removeAllSinks(): void;

logMgr.readSinkFilters(): { [name: string]: LogLevel };
logMgr.setSinkFilter(sinkName: string, logLevel: LogLevel): void;
```

## LogSink

`LogSink` is an interface which all sinks implement.

To make a custom sink, implement the interface then add the object to a LogManager.

```typescript
import { LogSink, logMgr, Logger, LogLevels } from "@hypericon/axe";

// LogSink is defined like this:
interface LogSink {
  /**
   * The unique name of the sink.
   * The name only needs to be unique within a single manager.
   */
  name: string,
  /**
   * The default minimum log level that a received message must have for it to be handled.
   * If the log level of a received message is lower than this, the message is ignored.
   * 
   * This can be overridden by individual logger instances.
   */
  logFilter: LogLevel,
  /**
   * Handle a logged message. The message does not need to be filtered again.
   * @param logMessage 
   */
  handleMessage(logMessage: LogMessage): any,
  /**
   * Gracefully destroy the sink. It cannot be used again.
   * (Method may be empty depending on the sink implementation)
   */
  destroy(): any,
}

// Create a custom sink, and register it with the default manager after removing the default console sink:

class MySink implements LogSink {
  name: "MySink",
  logLevel: LogLevels.log,

  constructor(settings: { /* ... */ }) {
    // ...
  }

  handleMessage(logMessage: LogMessage) {
    // ...
  }
  destroy() {
    // ...
  }
}

logMgr.removeAllSinks();
logMgr.addSink(new MySink({ /* ... */ }));

const logger = new Logger("Context");
logger.log("A message");
```

## ConsoleSink

Log messages to the console.

A single `ConsoleSink` is included by in the default `logMgr` instance exported from the library.

Example:

```typescript
import { Logger, logMgr, LogLevels, ConsoleSink } from "@hypericon/axe";

logMgr.removeAllSinks();
logMgr.addSink(new ConsoleSink({
  name: "ConsoleSink",
  logLevel: LogLevels.log,
}));

const logger = new Logger("Example");
logger.log("A message logged to the console");
```

## FileSink

Log messages to a file.

Example:

```typescript
import { Logger, logMgr, LogLevels, FileSink } from "@hypericon/axe";

logMgr.removeAllSinks();
const sink = new FileSink({
  name: "FileSink",
  logLevel: LogLevels.log,

  /**
   * Full path to the dir containing the log files
   * @default join(process.cwd(), "logs")
   */
  logDirPath?: string,
  /**
   * Function to build the filenames for new log files.
   * 
   * @default
   * () => {
   *   const logDate = new Date().toISOString()
   *     .replace(/:/g, "-")
   *     .replace(/\./g, "_");
   *   const logFileName = `${logDate}.txt`;
   *   return logFileName;
   *   // example: "2023-01-31T10-35-12_345Z.txt"
   * }
   */
  logFilenameFn?: () => string,
});
logMgr.addSink(sink);

const logger = new Logger("Example");
logger.log("A message logged to a file");

// Open a new log file.
// This can be useful to run on a schedule, so log files don't get too large,
// and so that logs are stored in a file with a relevant filename.
// For example, run this every midnight with the default `logFilenameFn` to
// (more or less) store all logs in a files named with the midnight timestamp.
sink.openNewFile();

// Interact with log files

// List existing log files
sink.listLogFiles(): Promise<{ logFiles: LogFileInfo[] }>;

// Read a particular log file
sink.readLogFile(filename: string): Promise<{ filename: string, contents: string }>;
```

## HypertableSink

Log messages to [Hypertable](https://hypertable.co.uk). For each new message, a new Record is created within a target Collection, with the data from the logged message written to the new Record.

Example:

```typescript
import { Logger, logMgr, LogLevels, HypertableSink } from "@hypericon/axe";

logMgr.removeAllSinks();
logMgr.addSink(new HypertableSink({
  name: "HypertableSink",
  logLevel: LogLevels.log,

  /** Hypertable API key with permission to create a Record */
  apiKey: string,
  /** The ID of the Project in which to create the new Record */
  projectId: string,
  /** The ID of the Collection in which to create the new Record */
  collectionId: string,
  /** Optionally override the Hypertable base URL */
  baseUrl?: string,
  /** Optionally override the field keys within the created Record */
  fieldKeys?: Partial<RecordFieldKeys>,
}));

const logger = new Logger("Example");
logger.log("A message logged to a new Hypertable record");
```

## ObservableSink

Log messages to an [RxJS](https://github.com/ReactiveX/rxjs) observable, so they can be easily consumed elsewhere in the application.

> Note: RxJS is a peer dependency of Axe, and must be installed separately.

Example:

```typescript
import { Logger, logMgr, LogLevels, ObservableSink } from "@hypericon/axe";

logMgr.removeAllSinks();
const sink = new ObservableSink({
  name: "ObservableSink",
  logLevel: LogLevels.log,
});
logMgr.addSink(sink);

// This would be consumed by the application after the desired log messages had been aggregated
sink.logMessage$.subscribe(msg => {
  // ...
});

const logger = new Logger("Example");
logger.log("A message logged to Observable");
```

## WebhookSink

Log messages to a webhook.

Example:

```typescript
import { Logger, logMgr, LogLevels, WebhookSink } from "@hypericon/axe";

logMgr.removeAllSinks();
logMgr.addSink(new WebhookSink({
  name: "WebhookSink",
  logLevel: LogLevels.warn,

  /** The URL to which to send the request */
  url: "https://some.url/api/123-456-789",
  /** Specify a different HTTP method */
  method?: "POST",
  /** Any additional headers to include with the request */
  headers?: {
    "Authorization": "...",
  },
  /** Optionally override the function building the request body */
  buildBody?: (logMessage: LogMessage) => {
    return { /* ... */ }
  },
}));

const logger = new Logger("Example");
logger.warn("A warning logged to the webhook");
```
