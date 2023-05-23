import { LogMessage, LogTransport } from "../interfaces";

// default filename template?
// path?

// method to delete older than?

export class FileTransport implements LogTransport {


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
