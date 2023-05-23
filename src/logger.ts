import { LogLevel, SimpleLogger, TransportFilter } from "./interfaces";
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
   * Map of transport names to minimum LogLevels required to use the transport.
   * If a filter level is not defined for a transport, the common transport filter level is used.
   */
  transportFilter = new TransportFilter();

  constructor(context?: string) {
    this.context = context;
  }

  error(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndTransport({
      level: "error",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.transportFilter);
  }

  warn(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndTransport({
      level: "warn",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.transportFilter);
  }

  log(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndTransport({
      level: "log",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.transportFilter);
  }

  debug(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndTransport({
      level: "debug",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.transportFilter);
  }

  verbose(...msgs: any[]) {
    if (this._core === undefined) return;

    return this._core.buildLogMessageAndTransport({
      level: "verbose",
      context: this.context,
      message: this._core.buildMessageString(...msgs),
    }, this.transportFilter);
  }

}
