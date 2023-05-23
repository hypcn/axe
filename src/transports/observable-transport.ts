import { Subject } from "rxjs";
import { LogMessage, LogTransport } from "../interfaces";

export class ObservableTransport implements LogTransport {

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
