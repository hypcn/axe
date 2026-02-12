import { inspect } from "util";
import { LogManager, logMgr } from "./log-manager";
import { LogLevel, SimpleLogger } from "./interfaces";

export class Logger implements SimpleLogger {

  /**
   * The manager this logger is associated with.
   * May be undefined if the logger has been destroyed or removed.
   * @internal
   */
  _manager: LogManager | undefined = logMgr;

  /**
   * This logger's context.
   * If undefined, the common context is used.
   */
  context: string | undefined;

  /**
   * The minimum log level that this logger will emit.
   * Messages below this level are filtered out before reaching any sinks.
   * @default undefined (no filtering at logger level)
   */
  minLevel: LogLevel | undefined;

  constructor(context?: string) {
    this.context = context;
  }

  error(...msgs: any[]) {
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter("error")) return;

    return this._manager.buildAndHandleLogMessage({
      level: "error",
      context: this.context,
      message: this.buildMessageString(...msgs),
    });
  }

  warn(...msgs: any[]) {
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter("warn")) return;

    return this._manager.buildAndHandleLogMessage({
      level: "warn",
      context: this.context,
      message: this.buildMessageString(...msgs),
    });
  }

  log(...msgs: any[]) {
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter("log")) return;

    return this._manager.buildAndHandleLogMessage({
      level: "log",
      context: this.context,
      message: this.buildMessageString(...msgs),
    });
  }

  debug(...msgs: any[]) {
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter("debug")) return;

    return this._manager.buildAndHandleLogMessage({
      level: "debug",
      context: this.context,
      message: this.buildMessageString(...msgs),
    });
  }

  verbose(...msgs: any[]) {
    if (this._manager === undefined) return;
    if (!this.levelSatisfiesLocalFilter("verbose")) return;

    return this._manager.buildAndHandleLogMessage({
      level: "verbose",
      context: this.context,
      message: this.buildMessageString(...msgs),
    });
  }

  protected levelSatisfiesLocalFilter(level: LogLevel): boolean {

    // If no filter, don't filter messages
    if (!this.minLevel) return true;

    return this._manager?.logLevelSatisfiesFilter(level, this.minLevel) ?? false;
  }

  protected buildMessageString(...msgs: any[]): string {

    // console.log("build message string from:", msgs);
    if (msgs.length === 0) return "";

    return msgs.map(msg => {
      if (msg === null) return "null";
      if (msg === undefined) return "undefined";
      if (typeof msg === "object") return inspect(msg);
      return msg.toString();
    }).join(" ");

  }

}
