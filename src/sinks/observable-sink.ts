import { Subject } from "rxjs";
import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class ObservableSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.debug;

  private _logMessage = new Subject<LogMessage>();
  public logMessage$ = this._logMessage.asObservable();

  private onError?: (error: Error) => void;

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,
    /** Optional error handler */
    onError?: (error: Error) => void,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;
    this.onError = settings.onError;
  }

  handleMessage(logMessage: LogMessage) {
    try {
      this._logMessage.next(logMessage);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) {
        this.onError(err);
      } else {
        console.error(`ObservableSink error for ${this.name}:`, err.message);
      }
    }
  }

  destroy() {
    // noop
  }

}
