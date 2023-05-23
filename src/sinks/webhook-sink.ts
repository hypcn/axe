import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class WebhookSink implements LogSink {

  name: string = this.constructor.name;
  logLevel: LogLevel = LogLevels.warn;

  constructor(settings: {
    name?: string,
    logLevel?: LogLevel,

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
    if (settings.logLevel) this.logLevel = settings.logLevel;


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
