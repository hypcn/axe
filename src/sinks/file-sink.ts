import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

// default filename template?
// path?

// method to delete older than?

export class FileSink implements LogSink {

  name: string = this.constructor.name;
  logLevel: LogLevel = LogLevels.log;

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
    // TODO: close file
  }

}
