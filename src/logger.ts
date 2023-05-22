import { LogTransport, SimpleLogger } from "./interfaces";
import { LoggerCore } from "./logger-core";

export class Logger implements SimpleLogger {

  /**
   * This logger's context.
   * If undefined, the common context is used from LoggerCore.
   */
  context: string | undefined;

  /**
   * The log transports to use for this logger.
   * If undefined, the common transports are used from LoggerCore.
   */
  transports?: LogTransport[] | undefined;

  constructor(context?: string) {
    this.context = context;

    LoggerCore.instances.add(this);
  }

  error(...msgs: any[]) {
    return LoggerCore.buildLogMessageAndTransport({
      level: "error",
      message: LoggerCore.buildMessageString(...msgs),
    }, this.transports);
  }

  warn(...msgs: any[]) {
    return LoggerCore.buildLogMessageAndTransport({
      level: "warn",
      message: LoggerCore.buildMessageString(...msgs),
    }, this.transports);
  }

  log(...msgs: any[]) {
    return LoggerCore.buildLogMessageAndTransport({
      level: "log",
      message: LoggerCore.buildMessageString(...msgs),
    }, this.transports);
  }

  debug(...msgs: any[]) {
    return LoggerCore.buildLogMessageAndTransport({
      level: "debug",
      message: LoggerCore.buildMessageString(...msgs),
    }, this.transports);
  }

  verbose(...msgs: any[]) {
    return LoggerCore.buildLogMessageAndTransport({
      level: "verbose",
      message: LoggerCore.buildMessageString(...msgs),
    }, this.transports);
  }

  

}
