# Axe

[![npm (scoped)](https://img.shields.io/npm/v/@hypericon/axe)](https://www.npmjs.com/package/@hypericon/axe)

A simple tool for logging. (Ha ha.)

Includes multiple built-in log sinks, with a simple API for adding arbitrary log handers

- Console
- File
- Webhook
- Rxjs observable
- [Hypertable](https://hypertable.co.uk)

Includes fine-grained filtering of logs by log level

- Set minimum log level handled by each log sink
- Override settings for individual logger instances
- Create separate manager instances with their own sinks for even more options

## Installation

Install with NPM:

```bash
npm install @hypericon/axe
```

## Example

Example Typescript usage:

```typescript
import { axeManager, ConsoleSink, CONSOLE_SINK, LogLevels, Logger, AxeManager } from "@hypericon/axe";

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
axeManager.setSinkFilter(CONSOLE_SINK, LogLevels.verbose);
axeManager.setSinkFilter("Console", "verbose"); // <- this is equivalent, but less robust to change
logger.verbose("verbose logs are ignored by default, but this is displayed.");

// Additional sinks can be added.
// (there is no good reason to have two console sinks, this is just an example)
const newConsoleSink = "Console2";
axeManager.addSink(new ConsoleSink({
  name: newConsoleSink,
  logLevel: LogLevels.log,
}));

// Separate sinks can have different log filters:
axeManager.setSinkFilter(newConsoleSink, LogLevels.warn);
// The current sink  log level filters can be read:
axeManager.readSinkFilters(); // { 'Console': 'verbose', 'Console2': 'warn' }
// This is useful for editing which log levels are logged where at runtime

// Separate manager instances can be created,
// with their own separate sink instances and log level filters
const newManager = new AxeManager({ withDefaultLogger: true });
const logger2 = newManager.newLogger("Logger 2");
logger2.log("This logger's manager 'newManager' is separate from 'axeManager' above.");
logger2.log("This allows them to configure their sinks and common filters separately.");

// Note: the "axeManager" import from the package is simply a prebuilt instance of
// `AxeManager` with the default console sink.
```

## Logger

