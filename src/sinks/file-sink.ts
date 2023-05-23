import { LogMessage, LogSink } from "../interfaces";

// default filename template?
// path?

// method to delete older than?

export class FileSink implements LogSink {


  constructor(settings?: {
    
  }) {


  }

  handleMessage(logMessage: LogMessage) {
    throw new Error("Method not implemented.");
  }

  destroy() {
    // TODO: close file
  }

}
