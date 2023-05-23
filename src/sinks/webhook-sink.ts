import { LogMessage, LogSink } from "../interfaces";

export class WebhookSink implements LogSink {

  constructor(settings: {
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


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
