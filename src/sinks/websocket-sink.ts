import { LogMessage, LogSink } from "../interfaces";

export class WebsocketSink implements LogSink {

  constructor(settings: {

  }) {


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
