import { LogLevel, LogLevelNumbers, LogLevels, LogMessage, LogSink } from "./interfaces";
import { SinkFilter } from "./interfaces/sink-filter.interface";
import { Logger } from "./logger";
import { ConsoleSink } from "./sinks";

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

  private sinks = new Map<string, LogSink>();

  // Common sink loglevel filter
  private commonSinkFilter = new SinkFilter();

  constructor(options?: { withDefaultConsoleLogger?: boolean }) {

    if (options?.withDefaultConsoleLogger) {
      this.addSink(CONSOLE_SINK, new ConsoleSink({
        noColour: isProd,
      }), isProd ? LogLevels.debug : LogLevels.log);
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

  addSink(name: string, sink: LogSink, defaultLogLevel: LogLevel) {
    if (this.sinks.has(name)) {
      throw new Error(`Cannot add new sink, name already in use: ${name}`);
    }

    this.sinks.set(name, sink);
    this.commonSinkFilter.set(name, defaultLogLevel);
  }

  /**
   * Gracefully stop the specified sink and remove it
   * @param name 
   */
  removeSink(name: string) {
    const sink = this.sinks.get(name);
    sink?.destroy();
    this.sinks.delete(name);
    this.commonSinkFilter.remove(name);
  }

  /**
   * Gracefully stop and remove all defined sinks
   * @param name 
   */
  async removeAllSinks() {
    for (const sinkName of this.sinks.keys()) {
      this.removeSink(sinkName);
    }
  }

  readSinkFilters() {
    return this.commonSinkFilter.read();
  }

  setSinkFilter(sinkName: string, logLevel: LogLevel) {
    return this.commonSinkFilter.set(sinkName, logLevel);
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

    for (const sinkName of this.sinks.keys()) {

      if (this.logLevelSatisfiesFilter(message.level, sinkFilter?.get(sinkName) ?? this.commonSinkFilter.get(sinkName) ?? LogLevels.none)) {
        this.sinks.get(sinkName)?.handleMessage(message);
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
    // none never satisfies anything, nor can it be satisfied
    if (logLevel === LogLevels.none || filterLevel === LogLevels.none) return false;

    return LogLevelNumbers[logLevel] <= LogLevelNumbers[filterLevel];
  }

}

/**
 * The default instance of the manager
 */
export const defaultAxeManager = new AxeManager({ withDefaultConsoleLogger: true });
