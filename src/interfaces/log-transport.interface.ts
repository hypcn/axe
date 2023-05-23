import { LogMessage } from "./log-message.interface";

export interface LogTransport {

  /**
   * 
   * @param logMessage 
   */
  handleMessage(logMessage: LogMessage): any,

  /**
   * Gracefully destroy the transport. It cannot be used again.
   */
  destroy(): any,
  
}
