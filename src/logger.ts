import { LogLevel, SimpleLogger, SinkFilter } from "./interfaces";
import { Axe, AxeCore } from "./axe-core";

export class Logger implements SimpleLogger {

  /**
   * The core instance this logger is associated with.
   * May be undefined if the logger has been destroyed for some reason.
   * @internal
   */
  _core: AxeCore | undefined = Axe;

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
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndSink({
      level: "error",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  warn(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndSink({
      level: "warn",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  log(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndSink({
      level: "log",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  debug(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndSink({
      level: "debug",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

  verbose(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndSink({
      level: "verbose",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.sinkFilter);
  }

}
