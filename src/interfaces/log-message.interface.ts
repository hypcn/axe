import { LogLevel } from "./log-level.interface";

export interface LogMessage {

  timestamp: Date,
  level: LogLevel,
  context: string,
  message: string,

  deviceId?: string,
  deviceName?: string,
  processId?: string,

}
