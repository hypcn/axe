import { LogMessage, LogTransport } from "../interfaces";

export class WebsocketTransport implements LogTransport {

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
