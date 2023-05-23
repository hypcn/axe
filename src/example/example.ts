import { Axe, ConsoleSink, CONSOLE_SINK, LogLevels, Logger, AxeCore } from "..";

function exampleUsage() {

  const logger = new Logger("Logger");
  const otherConsoleName = "Other Console";

  logger.log("This is a log.");
  logger.log("There are 5 log levels: 'error', 'warn', 'log', 'debug', and 'verbose'.\n");

  const contextLogger = new Logger("Context");
  contextLogger.log("Multiple loggers can be created, with separate 'contexts'.", "\n");

  const filterLogger = new Logger("Filters");

  filterLogger.log("By default, only 'debug' logs and above are handled, so:");
  filterLogger.verbose("this verbose log is *not* displayed");
  filterLogger.log("But if the filter is set to 'verbose' for the default console sink:");
  Axe.setSinkFilter(CONSOLE_SINK, LogLevels.verbose);
  filterLogger.verbose("then this second verbose log *is* displayed", "\n");

  const sinkLogger = new Logger("Sinks");

  sinkLogger.log("More sinks may be added.");
  sinkLogger.log("Adding another console sink, only logging warnings and errors:");
  sinkLogger.debug("(Normally you wouldn't use two console sinks, but this is an example)");
  Axe.addSink(otherConsoleName, new ConsoleSink(), LogLevels.warn);
  sinkLogger.warn("this warning is logged twice");
  sinkLogger.log("but this log is only logged once, as the second sink ignores it.", "\n");

  sinkLogger.log("The current sink filters are:", Axe.readSinkFilters());
  sinkLogger.log("If the filter for the second sink is set to 'error':");
  Axe.setSinkFilter(otherConsoleName, "error");
  sinkLogger.warn("then this warning is only displayed once.", "\n");

  sinkLogger.log("Adding a sink with the same name throws an error:");
  try {
    Axe.addSink(otherConsoleName, new ConsoleSink(), LogLevels.warn);
  } catch (error) {
    sinkLogger.error((error as Error).message);
    sinkLogger.log("...which is displayed twice as there are still two sinks.", "\n");
  }

  sinkLogger.log("After removing the other console sink:");
  Axe.removeSink(otherConsoleName);
  sinkLogger.log("there is only one sink filter remaining:", Axe.readSinkFilters(), "\n");
  
  logger.log("Separate instances of the core can be instantiated:");

  const Axe2 = new AxeCore({ withDefaultConsoleLogger: true });
  const newCoreLogger = Axe2.newLogger("New Instance");
  newCoreLogger.log("...so this logger does not share any settings with the other two.");
  newCoreLogger.log("For example, if this instance of the core is set to only log errors:");
  Axe2.setSinkFilter(CONSOLE_SINK, LogLevels.error);

  logger.log("...then this logger can still display logs");
  contextLogger.log("...and so can this one");
  newCoreLogger.log("...but *not* this one");
  newCoreLogger.error("...though it can still display errors.");
  logger.log("The default core instance is exported from the package as 'Axe'.\n");

  const localFilterLogger = new Logger("Local Filter");

  localFilterLogger.log("Individual loggers can set their own log filters.");
  localFilterLogger.log("Setting this logger's console filter to 'warn':");
  localFilterLogger.sinkFilter.set(CONSOLE_SINK, LogLevels.warn);
  localFilterLogger.log("...so it *can't* display logs");
  localFilterLogger.warn("...but it *can* display warnings");
  logger.log("And other loggers are unaffected.\n");

}
exampleUsage();
