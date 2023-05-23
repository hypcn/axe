import { LogLevel } from "./log-level.interface";
import { LogMessage } from "./log-message.interface";

export interface LogSink {

  /**
   * The unique name of the sink.
   * The name only needs to be unique with a single manager.
   */
  name: string,

  /**
   * The default minimum log level that a received message must have for it to be handled.
   * If the log level of a received message is lower than this, the message is ignored.
   * 
   * This can be overridden by individual logger instances.
   */
  logLevel: LogLevel,

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
