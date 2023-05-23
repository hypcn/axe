import { defaultAxeManager, ConsoleSink, CONSOLE_SINK, LogLevels, Logger, AxeManager } from "..";

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
  defaultAxeManager.setSinkFilter(CONSOLE_SINK, LogLevels.verbose);
  filterLogger.verbose("then this second verbose log *is* displayed", "\n");

  const sinkLogger = new Logger("Sinks");

  sinkLogger.log("More sinks may be added.");
  sinkLogger.log("Adding another console sink, only logging warnings and errors:");
  sinkLogger.debug("(Normally you wouldn't use two console sinks, but this is an example)");
  defaultAxeManager.addSink(otherConsoleName, new ConsoleSink(), LogLevels.warn);
  sinkLogger.warn("this warning is logged twice");
  sinkLogger.log("but this log is only logged once, as the second sink ignores it.", "\n");

  sinkLogger.log("The current sink filters are:", defaultAxeManager.readSinkFilters());
  sinkLogger.log("If the filter for the second sink is set to 'error':");
  defaultAxeManager.setSinkFilter(otherConsoleName, "error");
  sinkLogger.warn("then this warning is only displayed once.", "\n");

  sinkLogger.log("Adding a sink with the same name throws an error:");
  try {
    defaultAxeManager.addSink(otherConsoleName, new ConsoleSink(), LogLevels.warn);
  } catch (error) {
    sinkLogger.error((error as Error).message);
    sinkLogger.log("...which is displayed twice as there are still two sinks.", "\n");
  }

  sinkLogger.log("After removing the other console sink:");
  defaultAxeManager.removeSink(otherConsoleName);
  sinkLogger.log("there is only one sink filter remaining:", defaultAxeManager.readSinkFilters(), "\n");
  
  logger.log("Separate manager instances can be instantiated:");

  const axeManager2 = new AxeManager({ withDefaultConsoleLogger: true });
  const newMgrLogger = axeManager2.newLogger("New Manager");
  newMgrLogger.log("...so this logger does not share any settings with the other two.");
  newMgrLogger.log("For example, if this manager is set to only log errors:");
  axeManager2.setSinkFilter(CONSOLE_SINK, LogLevels.error);

  logger.log("...then this logger can still display logs");
  contextLogger.log("...and so can this one");
  newMgrLogger.log("...but *not* this one");
  newMgrLogger.error("...though it can still display errors.");
  logger.log("The default manager instance is exported from the package as 'defaultAxeManager'.\n");

  const localFilterLogger = new Logger("Local Filter");

  localFilterLogger.log("Individual loggers can set their own log filters.");
  localFilterLogger.log("Setting this logger's console filter to 'warn':");
  localFilterLogger.sinkFilter.set(CONSOLE_SINK, LogLevels.warn);
  localFilterLogger.log("...so it *can't* display logs");
  localFilterLogger.warn("...but it *can* display warnings");
  logger.log("And other loggers are unaffected.\n");

}
exampleUsage();
