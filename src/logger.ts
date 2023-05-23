import { inspect } from "util";
import { AxeManager, axeManager } from "./axe-manager";
import { SimpleLogger } from "./interfaces";
import { SinkFilter } from "./sink-filter";

export class Logger implements SimpleLogger {

  /**
   * The manager this logger is associated with.
   * May be undefined if the logger has been destroyed or removed.
   * @internal
   */
  _manager: AxeManager | undefined = axeManager;

  /**
   * This logger's context.
   * If undefined, the common context is used.
   */
  context: string | undefined;

  /**
   * Map of sink names to minimum LogLevels required to use the sink.
   * If a filter level is not defined for a sink, the common sink filter level is used.
   */
  sinkFilter = new SinkFilter();

  constructor(context?: string) {
    this.context = context;
  }

  error(...msgs: any[]) {
    if (this._manager === undefined) return;

    return this._manager.buildAndHandleLogMessage({
      level: "error",
      context: this.context,
      message: this.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  warn(...msgs: any[]) {
    if (this._manager === undefined) return;

    return this._manager.buildAndHandleLogMessage({
      level: "warn",
      context: this.context,
      message: this.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  log(...msgs: any[]) {
    if (this._manager === undefined) return;

    return this._manager.buildAndHandleLogMessage({
      level: "log",
      context: this.context,
      message: this.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  debug(...msgs: any[]) {
    if (this._manager === undefined) return;

    return this._manager.buildAndHandleLogMessage({
      level: "debug",
      context: this.context,
      message: this.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  verbose(...msgs: any[]) {
    if (this._manager === undefined) return;

    return this._manager.buildAndHandleLogMessage({
      level: "verbose",
      context: this.context,
      message: this.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  private buildMessageString(...msgs: any[]): string {

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
