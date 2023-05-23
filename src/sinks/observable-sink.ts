import { Subject } from "rxjs";
import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class ObservableSink implements LogSink {

  name: string = this.constructor.name;
  logLevel: LogLevel = LogLevels.debug;

  private _logMessage = new Subject<LogMessage>();
  public logMessage$ = this._logMessage.asObservable();

  constructor(settings: {
    name?: string,
    logLevel?: LogLevel,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logLevel) this.logLevel = settings.logLevel;
  }

  handleMessage(logMessage: LogMessage) {
    this._logMessage.next(logMessage);
  }

  destroy() {
    // noop
  }

}
