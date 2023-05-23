import { Axe, ConsoleTransport, CONSOLE_TRANSPORT, LogLevels, Logger, LoggerCore } from "..";

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
  filterLogger.log("But if the filter is set to 'verbose' for the default console transport:");
  Axe.setTransportFilter(CONSOLE_TRANSPORT, LogLevels.verbose);
  filterLogger.verbose("then this second verbose log *is* displayed", "\n");

  const transportLogger = new Logger("Transports");

  transportLogger.log("More transports may be added.");
  transportLogger.log("Adding another console transport, only logging warnings and errors:");
  transportLogger.debug("(Normally you wouldn't use two console transports, but this is an example)");
  Axe.addTransport(otherConsoleName, new ConsoleTransport({ noColour: true }), LogLevels.warn);
  transportLogger.warn("this warning is logged twice");
  transportLogger.log("but this log is only logged once, as the second transport ignores it.", "\n");

  transportLogger.log("The current transport filters are:", Axe.readTransportFilters());
  transportLogger.log("If the filter for the second transport is set to 'error':");
  Axe.setTransportFilter(otherConsoleName, "error");
  transportLogger.warn("then this warning is only displayed once.", "\n");

  transportLogger.log("Adding a transport with the same name throws an error:");
  try {
    Axe.addTransport(otherConsoleName, new ConsoleTransport({ noColour: true }), LogLevels.warn);
  } catch (error) {
    transportLogger.error((error as Error).message);
    transportLogger.log("...which is displayed twice as there are still two transports.", "\n");
  }

  transportLogger.log("After removing the other console transport:");
  Axe.removeTransport(otherConsoleName);
  transportLogger.log("there is only one transport filter remaining:", Axe.readTransportFilters(), "\n");
  
  logger.log("Separate instances of LoggerCore can be instantiated:");

  const loggerCore = new LoggerCore({ withDefaultConsoleLogger: true });
  const newCoreLogger = loggerCore.newLogger("New Instance");
  newCoreLogger.log("...so this logger does not share any settings with the other two.");
  newCoreLogger.log("For example, if this instance of LoggerCore is set to only log errors:");
  loggerCore.setTransportFilter(CONSOLE_TRANSPORT, LogLevels.error);

  logger.log("...then this logger can still display logs");
  contextLogger.log("...and so can this one");
  newCoreLogger.log("...but *not* this one");
  newCoreLogger.error("...though it can still display errors.");
  logger.log("The default LoggerCore instance is exported from the package as 'Axe'.\n");

  const localFilterLogger = new Logger("Local Filter");

  localFilterLogger.log("Individual loggers can set their own log filters.");
  localFilterLogger.log("Setting this logger's console filter to 'warn':");
  localFilterLogger.transportFilter.set(CONSOLE_TRANSPORT, LogLevels.warn);
  localFilterLogger.log("...so it *can't* display logs");
  localFilterLogger.warn("...but it *can* display warnings");
  logger.log("And other loggers are unaffected.\n");

}
exampleUsage();
