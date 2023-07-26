import { LogLevel, LogLevelNumber, LogLevels, LogMessage, LogSink } from "./interfaces";
import { SinkFilter } from "./sink-filter";
import { Logger } from "./logger";
import { ConsoleSink } from "./sinks";

export type Class<T> = new (...args: any[]) => T;

/** The name of the default console sink */
export const CONSOLE_SINK = "Console";

const isProd = (process !== undefined)
  ? (process?.env.NODE_ENV?.toLowerCase() === "production" ||
    process?.env.NODE_ENV?.toLowerCase() === "prod")
  : false;

export class LogManager {

  /** A default logger "context" if one is not configured, common across logger instances */
  commonContext: string = "";
  /** A default log level if one is not configured, common across logger instances */
  commonLogLevel: LogLevel = LogLevels.log;

  /** A device ID, common across logger instances */
  commonDeviceId: string | undefined;
  /** A device Name, common across logger instances */
  commonDeviceName: string | undefined;
  /** The process ID, common across logger instances */
  commonProcessId: string = process?.pid.toString() ?? "";

  /**
   * List of Logger instances, to make them available for centralised sink and
   * log level configuration via API
   */
  private loggerInstances: Logger[] = [];

  private sinks: LogSink[] = [];

  get loggerCount() { return this.loggerInstances.length; }
  get sinkCount() { return this.sinks.length; }

  constructor(options?: { withDefaultConsoleSink?: boolean }) {

    if (options?.withDefaultConsoleSink) {
      this.addSink(new ConsoleSink({
        name: CONSOLE_SINK,
        logFilter: isProd ? LogLevels.log : LogLevels.verbose,
        noColour: isProd,
      }));
    }

  }

  // ===== Logger Instances

  /**
   * Create a new Logger associated with this manager
   * @param context 
   * @returns 
   */
  createLogger(context?: string) {
    const logger = new Logger(context);
    this.addLogger(logger);
    return logger;
  }

  /**
   * Adds the given logger to this manager, removing it from its previous manager
   * @param logger 
   */
  addLogger(logger: Logger) {
    logger._manager?.removeLogger(logger);
    logger._manager = this;
    this.loggerInstances.push(logger);
  }

  /**
   * Remove the given logger from this manager, and remove the logger's manager reference
   * @param logger 
   */
  removeLogger(logger: Logger) {
    this.loggerInstances = this.loggerInstances.filter(l => l !== logger);
    logger._manager = undefined;
  }

  // ===== Log Sinks

  /**
   * Find the log sink with the given name (if it exists)
   * @param name 
   * @returns 
   */
  findSinkByName(name: string): LogSink | undefined {
    return this.sinks.find(s => s.name === name);
  }

  /**
   * Find  the first log sink of the given class
   * @param sinkClass 
   * @returns 
   */
  findSink<T extends LogSink>(sinkClass: Class<T>): T | undefined {
    return this.sinks.find(s => s.constructor === sinkClass) as T | undefined;
  }

  /**
   * Add a new log sink to the manager
   * @param sink 
   * @throws if the name is already in use
   */
  addSink(sink: LogSink) {
    const existingName = this.findSinkByName(sink.name);
    if (existingName) {
      throw new Error(`Cannot add new sink, name already in use: ${sink.name}`);
    }
    this.sinks.push(sink);
  }

  /**
   * Gracefully stop the specified sink and remove it
   * @param name 
   */
  removeSinkByName(name: string) {
    const sink = this.findSinkByName(name);
    if (sink) return this.removeSink(sink);
  }

  /**
   * Gracefully stop the given sink and remove it
   * @param sink 
   */
  removeSink(sink: LogSink) {
    sink.destroy();
    this.sinks = this.sinks.filter(s => s !== sink);
  }

  /**
   * Gracefully stop and remove all defined sinks
   * @param name 
   */
  removeAllSinks() {
    for (const sink of this.sinks) {
      this.removeSink(sink);
    }
  }

  /**
   * Read the configured log level filters of all the configured log sinks
   * @returns 
   */
  readSinkFilters(): { [name: string]: LogLevel } {
    const sinkLogFilters: { [name: string]: LogLevel } = {};
    for (const sink of this.sinks) {
      sinkLogFilters[sink.name] = sink.logFilter;
    }
    return sinkLogFilters;
  }

  /**
   * Set the log level filter of the sink with the given name
   * @param sinkName 
   * @param logLevel 
   */
  setSinkFilter(sinkName: string, logLevel: LogLevel) {
    const sink = this.findSinkByName(sinkName);
    if (sink) sink.logFilter = logLevel;
  }

  // ===== Handle Log Messages

  /**
   * Builds a complete LogMessage from a partial message, falling back on common default values
   * @param partalMsg 
   * @returns 
   */
  buildLogMessage(partalMsg: Partial<LogMessage>): LogMessage {

    return {
      context: partalMsg.context ?? this.commonContext,
      level: partalMsg.level ?? this.commonLogLevel,
      message: partalMsg.message ?? "",
      timestamp: partalMsg.timestamp ?? new Date(),

      deviceId: partalMsg.deviceId ?? this.commonDeviceId,
      deviceName: partalMsg.deviceName ?? this.commonDeviceName,
      processId: partalMsg.processId ?? this.commonProcessId,
    };

  }

  /**
   * Pass a given message to all the log sinks which have filter settings accepting the log message
   * @param message 
   * @param sinkFilter 
   */
  handleLogMessage(message: LogMessage, sinkFilter?: SinkFilter) {

    for (const sink of this.sinks) {
      if (this.logLevelSatisfiesFilter(message.level, sinkFilter?.get(sink.name) ?? sink.logFilter)) {
        sink.handleMessage(message);
      }
    }

  }

  /**
   * Build a complete log message from a partial message, and pass it to all
   * log sinks which are "interested" in the message
   * @param partialMsg 
   * @param sinkFilter 
   * @returns 
   */
  buildAndHandleLogMessage(partialMsg: Partial<LogMessage>, sinkFilter?: SinkFilter) {
    return this.handleLogMessage(this.buildLogMessage(partialMsg), sinkFilter);
  }

  /**
   * Determine if a given log level satisfies a log level filter
   * @param logLevel 
   * @param filterLevel 
   * @returns 
   */
  logLevelSatisfiesFilter(logLevel: LogLevel, filterLevel: LogLevel): boolean {
    // "none" never satisfies anything, nor can it be satisfied
    if (logLevel === LogLevels.none || filterLevel === LogLevels.none) return false;

    return LogLevelNumber[logLevel] <= LogLevelNumber[filterLevel];
  }

}

/**
 * The default instance of the manager
 */
export const logMgr = new LogManager({ withDefaultConsoleSink: true });
