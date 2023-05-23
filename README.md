# Axe

[![npm (scoped)](https://img.shields.io/npm/v/@hypericon/axe)](https://www.npmjs.com/package/@hypericon/axe)

A simple tool for logging. (Ha ha.)

Includes multiple built-in log sinks, with a simple API for adding arbitray log handers.

- Console
- File
- Webhook
- Rxjs observable
- [Hypertable](https://hypertable.co.uk)

Includes fine-grained control 

## Installation

Install using NPM:

```bash
npm install @hypericon/axe
```

## Example

Example Typescript usage:

```typescript
import { Axe, ConsoleSink, CONSOLE_SINK, LogLevels, Logger, AxeCore } from "@hypericon/axe";

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
Axe.setSinkFilter(CONSOLE_SINK, LogLevels.verbose);
Axe.setSinkFilter("Console", "verbose"); // <- this is equivalent, but less robust to change
logger.verbose("verbose logs are ignored by default, but this is displayed.");

// Additional sinks can be added.
// (there is no good reason to have two console sinks, this is just an example)
const newConsoleSink = "Console2";
Axe.addSink(newConsoleSink, new ConsoleSink(), LogLevels.log);

// Separate sinks can have different log filters:
Axe.setSinkFilter(newConsoleSink, LogLevels.warn);
// The current sink  log level filters can be read:
Axe.readSinkFilters(); // { 'Console': 'verbose', 'Console2': 'warn' }
// This is useful for editing which log levels are logged where at runtime

// Separate instances of the core can be created,
// with their own separate sink instances and log level filters
const Axe2 = new AxeCore({ withDefaultLogger: true });
const logger2 = Axe2.newLogger("Logger 2");
logger2.log("This logger's core 'Axe2' is separate from 'Axe' above.");
logger2.log("This allows them to configure their sinks and common filters separately.");

// Note: the "Axe" import from the package is simply a prebuilt instance of AxeCore
// with the default console sink.

```


