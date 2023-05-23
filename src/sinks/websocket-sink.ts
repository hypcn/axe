import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class WebsocketSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.warn;

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
