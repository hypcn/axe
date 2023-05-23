import { Subject } from "rxjs";
import { LogMessage, LogSink } from "../interfaces";

export class ObservableSink implements LogSink {

  private _logMessage = new Subject<LogMessage>();
  public logMessage$ = this._logMessage.asObservable();

  constructor() {}

  handleMessage(logMessage: LogMessage) {
    this._logMessage.next(logMessage);
  }

  destroy() {
    // anything?
  }

}
