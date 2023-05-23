import { LogLevel, LogLevelNumbers, LogLevels, LogMessage, LogSink } from "./interfaces";
import { SinkFilter } from "./interfaces/sink-filter.interface";
import { Logger } from "./logger";
import { ConsoleSink } from "./sinks";

export type Class<T> = new (...args: any[]) => T;

/** The name of the default console sink */
export const CONSOLE_SINK = "Console";

const isProd = process.env.NODE_ENV === "production";

export class AxeManager {

  commonContext: string = "";
  commonLogLevel: LogLevel = LogLevels.log;

  commonDeviceId: string | undefined;
  commonDeviceName: string | undefined;
  commonProcessId: string = process.pid.toString();

  /**
   * List of Logger instances, to make them available for centralised sink and
   * log level configuration via API
   */
  private loggerInstances: Logger[] = [];

  private sinks: LogSink[] = [];

  constructor(options?: { withDefaultConsoleLogger?: boolean }) {

    if (options?.withDefaultConsoleLogger) {
      this.addSink(new ConsoleSink({
        name: CONSOLE_SINK,
        logLevel: isProd ? LogLevels.debug : LogLevels.log,
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
  newLogger(context?: string) {
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

  getSinkByName(name: string): LogSink | undefined {
    return this.sinks.find(s => s.name === name);
  }

  getSinkByType<T extends LogSink>(sinkClass: Class<T>): T | undefined {
    return this.sinks.find(s => s.constructor === sinkClass) as T | undefined;
  }

  addSink(sink: LogSink) {
    const existingName = this.getSinkByName(sink.name);
    if (existingName) {
      throw new Error(`Cannot add new sink, name already in use: ${name}`);
    }
    this.sinks.push(sink);
  }

  /**
   * Gracefully stop the specified sink and remove it
   * @param name 
   */
  removeSinkByName(name: string) {
    const sink = this.getSinkByName(name);
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

  readSinkFilters() {
    const sinkLogFilters: { [name: string]: LogLevel } = {};
    for (const sink of this.sinks) {
      sinkLogFilters[sink.name] = sink.logLevel;
    }
    return sinkLogFilters;
  }

  setSinkFilter(sinkName: string, logLevel: LogLevel) {
    const sink = this.getSinkByName(sinkName);
    if (sink) sink.logLevel = logLevel;
  }

  // ===== Handle Log Messages

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

  handleLogMessage(message: LogMessage, sinkFilter?: SinkFilter) {

    for (const sink of this.sinks) {
      if (this.logLevelSatisfiesFilter(message.level, sinkFilter?.get(sink.name) ?? sink.logLevel ?? LogLevels.none)) {
        sink.handleMessage(message);
      }
    }

  }

  buildAndHandleLogMessage(partialMsg: Partial<LogMessage>, sinkFilter?: SinkFilter) {
    return this.handleLogMessage(this.buildLogMessage(partialMsg), sinkFilter);
  }

  /**
   * 
   * @param logLevel 
   * @param filterLevel 
   * @returns 
   */
  logLevelSatisfiesFilter(logLevel: LogLevel, filterLevel: LogLevel): boolean {
    // "none" never satisfies anything, nor can it be satisfied
    if (logLevel === LogLevels.none || filterLevel === LogLevels.none) return false;

    return LogLevelNumbers[logLevel] <= LogLevelNumbers[filterLevel];
  }

}

/**
 * The default instance of the manager
 */
export const axeManager = new AxeManager({ withDefaultConsoleLogger: true });
