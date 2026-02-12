import { LogLevel } from "./log-level.interface";
import { LogMessage } from "./log-message.interface";

export interface LogSink {

  /**
   * The unique name of the sink.
   * The name only needs to be unique within a single manager.
   */
  name: string,

  /**
   * The minimum log level that a received message must have for it to be handled.
   * If the log level of a received message is lower than this, the message is ignored.
   */
  minLevel: LogLevel,

  /**
   * Handle a logged message. The message does not need to be filtered again.
   * @param logMessage 
   */
  handleMessage(logMessage: LogMessage): any,

  /**
   * Gracefully destroy the sink. It cannot be used again.
   * (Method may be empty depending on the sink implementation)
   */
  destroy(): any,
  
}
