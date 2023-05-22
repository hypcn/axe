import { LogLevel } from "./log-level.interface";
import { LogMessage } from "./log-message.interface";

export interface LogTransport {

  /**
   * The minimum priority log level that a log message must have to be handled by the transport.
   * Any logged message with a lower priority log level will be discarded.
   */
  logLevel: LogLevel;

  /**
   * 
   * @param logMessage 
   */
  handleMessage(logMessage: LogMessage): any,
  
}
