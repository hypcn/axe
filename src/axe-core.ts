import { inspect } from "util";
import { LogLevel, LogLevelNumbers, LogLevels, LogMessage, LogTransport } from "./interfaces";
import { ConsoleTransport } from "./transports";
import { Logger } from "./logger";
import { TransportFilter } from "./interfaces/transport-filter.interface";

/** The name of the default console transport */
export const CONSOLE_TRANSPORT = "Console";

const isProd = process.env.NODE_ENV === "production";

export class AxeCore {

  // commonSettings = {  };
  commonContext: string = "";
  commonLogLevel: LogLevel = "log";

  commonDeviceId: string | undefined;
  commonDeviceName: string | undefined;
  commonProcessId: string = process.pid.toString();

  /**
   * Weak references to Logger instances, to make them available for centralised transport and
   * log level configuration via API
   */
  private loggerInstances: Logger[] = [];

  private transports = new Map<string, LogTransport>();

  // some sort of common mapping of LogLevels to transports
  private commonTransportFilter = new TransportFilter();

  constructor(options?: { withDefaultConsoleLogger?: boolean }) {

    if (options?.withDefaultConsoleLogger) {
      this.addTransport(CONSOLE_TRANSPORT, new ConsoleTransport({
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

  // ===== Log Transports

  addTransport(name: string, transport: LogTransport, defaultLogLevel: LogLevel) {
    if (this.transports.has(name)) {
      throw new Error(`Cannot add new transport, name already in use: ${name}`);
    }

    this.transports.set(name, transport);
    this.commonTransportFilter.set(name, defaultLogLevel);
  }

  /**
   * Gracefully stop the specified transport and remove it
   * @param name 
   */
  removeTransport(name: string) {
    const transport = this.transports.get(name);
    transport?.destroy();
    this.transports.delete(name);
    this.commonTransportFilter.remove(name);
  }

  /**
   * Gracefully stop and remove all defined transports
   * @param name 
   */
  async removeAllTransports(name: string) {
    for (const transportName of this.transports.keys()) {
      this.removeTransport(transportName);
    }
  }

  readTransportFilters() {
    return this.commonTransportFilter.read();
  }

  setTransportFilter(transportName: string, logLevel: LogLevel) {
    return this.commonTransportFilter.set(transportName, logLevel);
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

  transportLogMessage(message: LogMessage, transportFilter?: TransportFilter) {

    for (const transportName of this.transports.keys()) {

      if (this.logLevelSatisfiesFilter(message.level, transportFilter?.get(transportName) ?? this.commonTransportFilter.get(transportName) ?? LogLevels.none)) {
        this.transports.get(transportName)?.handleMessage(message);
      }

    }

  }

  buildLogMessageAndTransport(partialMsg: Partial<LogMessage>, transportFilter?: TransportFilter) {
    return this.transportLogMessage(this.buildLogMessage(partialMsg), transportFilter);
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
