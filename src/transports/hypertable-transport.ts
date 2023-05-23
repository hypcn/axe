import { LogMessage, LogTransport } from "../interfaces";

// default but overrideable field keys?

export class HypertableTransport implements LogTransport {


  constructor(settings: {
    apiKey: string,
    projectId: string,
    collectionId: string,
  }) {


  }

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  destroy() {
    // anything?
  }

}
