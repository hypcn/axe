import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class WebhookSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.warn;

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

    /** The URL to which to send the request */
    url: string,
    /**
     * Specify a different HTTP method
     * @default "POST"
     */
    method?: string,
    /** Any additional headers to include with the request */
    headers?: { [key: string]: string },
    /** Optionally override the function building the request body */
    buildBody?: (logMessage: LogMessage) => object,
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
