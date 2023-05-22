import { LogLevel } from "./log-level.interface";

export interface SimpleLogger {

  // setLogLevel(logLevel: LogLevel): any,

  error(...msgs: any[]): any,
  
  warn(...msgs: any[]): any,
  
  log(...msgs: any[]): any,
  
  debug(...msgs: any[]): any,
  
  verbose(...msgs: any[]): any,
  
}
