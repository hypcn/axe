import { LogLevel, LogLevels } from "../interfaces";
import { Logger } from "../logger";

/**
 * Logger wrapping the standard logger to format log messages from NestJS
 */
export class NestLogger extends Logger {

  constructor(
    context?: string,
  ) {
    super(context ?? "Nest");
  }

  private performLog(level: LogLevel, ...msgs: any[]) {

    // As in Logger
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter(level)) return;

    // Conditionally use the last element as the context string
    // This is due to how NestJS formats its logs
    let ctx = this.context;
    let msgBits = msgs.slice();
    if (msgs.length > 1 && typeof msgs[msgs.length - 1] === "string") {
      ctx = msgs[msgs.length - 1];
      msgBits = msgs.slice(0, -1);
    }

    // As in Logger
    return this._manager.buildAndHandleLogMessage({
      level: level,
      context: ctx,
      message: this.buildMessageString(msgBits),
    }, this.sinkFilter);

  }

  error(...msgs: any[]) {
    this.performLog(LogLevels.error, ...msgs);
  }

  warn(...msgs: any[]) {
    this.performLog(LogLevels.warn, ...msgs);
  }

  log(...msgs: any[]) {
    this.performLog(LogLevels.log, ...msgs);
  }

  debug(...msgs: any[]) {
    this.performLog(LogLevels.debug, ...msgs);
  }

  verbose(...msgs: any[]) {
    this.performLog(LogLevels.verbose, ...msgs);
  }

  // /** Log a message directly to the cloud */
  // logDirectlyToCloud(msg: Partial<LogMessage>) {
  //   const toSend = this.logger.buildLogMessage(msg);
  //   this.cloudLogger.logMessage(toSend);
  // }

}
