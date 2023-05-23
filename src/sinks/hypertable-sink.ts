import { LogMessage, LogSink } from "../interfaces";

// default but overrideable field keys?

export class HypertableSink implements LogSink {


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
