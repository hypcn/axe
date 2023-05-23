import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class WebsocketSink implements LogSink {

  name: string = this.constructor.name;
  logLevel: LogLevel = LogLevels.warn;

  constructor(settings: {
    name?: string,
    logLevel?: LogLevel,

  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logLevel) this.logLevel = settings.logLevel;


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
