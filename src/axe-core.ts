import { inspect } from "util";
import { LogLevel, LogLevelNumbers, LogLevels, LogMessage, LogSink } from "./interfaces";
import { ConsoleSink } from "./sinks";
import { Logger } from "./logger";
import { SinkFilter } from "./interfaces/sink-filter.interface";

/** The name of the default console sink */
export const CONSOLE_SINK = "Console";

const isProd = process.env.NODE_ENV === "production";

export class AxeCore {

  // commonSettings = {  };
  commonContext: string = "";
  commonLogLevel: LogLevel = "log";

  commonDeviceId: string | undefined;
  commonDeviceName: string | undefined;
  commonProcessId: string = process.pid.toString();

  /**
   * Weak references to Logger instances, to make them available for centralised sink and
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
   * Create a new Logger associated with this core instance
   * @param context 
   * @returns 
   */
  newLogger(context?: string) {
    const logger = new Logger(context);
    this.addLogger(logger);
    return logger;
  }

  /**
   * Adds the given logger to this core instance, removing it from its previous core instance
   * @param logger 
   */
  addLogger(logger: Logger) {
    logger._core?.removeLogger(logger);
    logger._core = this;
    this.loggerInstances.push(logger);
  }

  removeLogger(logger: Logger) {
    this.loggerInstances = this.loggerInstances.filter(l => l !== logger);
    logger._core = undefined;
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

  // ===== Perform Logging

  buildMessageString(...msgs: any[]): string {

    // console.log("build message string from:", msgs);
    if (msgs.length === 0) return "";

    return msgs.map(msg => {
      if (msg === null) return "null";
      if (msg === undefined) return "undefined";
      if (typeof msg === "object") return inspect(msg);
      return msg.toString();
    }).join(" ");

  }

  buildLogMessage(partalMsg: Partial<LogMessage>): LogMessage {

    return {
      context: partalMsg.context ?? this.commonContext,
      level: partalMsg.level ?? "log",
      message: partalMsg.message ?? "",
      timestamp: partalMsg.timestamp ?? new Date(),

      deviceId: partalMsg.deviceId,
      deviceName: partalMsg.deviceName,
      processId: partalMsg.processId ?? this.commonProcessId,
    };

  }

  sinkLogMessage(message: LogMessage, sinkFilter?: SinkFilter) {

    for (const sinkName of this.sinks.keys()) {

      if (this.logLevelSatisfiesFilter(message.level, sinkFilter?.get(sinkName) ?? this.commonSinkFilter.get(sinkName) ?? LogLevels.none)) {
        this.sinks.get(sinkName)?.handleMessage(message);
      }

    }

  }

  buildLogMessageAndSink(partialMsg: Partial<LogMessage>, sinkFilter?: SinkFilter) {
    return this.sinkLogMessage(this.buildLogMessage(partialMsg), sinkFilter);
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
 * The default instance of the logger core
 */
export const Axe = new AxeCore({ withDefaultConsoleLogger: true });
