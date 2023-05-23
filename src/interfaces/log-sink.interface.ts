import { LogMessage } from "./log-message.interface";

export interface LogSink {

  /**
   * 
   * @param logMessage 
   */
  handleMessage(logMessage: LogMessage): any,

  /**
   * Gracefully destroy the sink. It cannot be used again.
   */
  destroy(): any,
  
}
