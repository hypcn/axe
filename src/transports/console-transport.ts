import { LogLevel, LogLevels } from "../interfaces/log-level.interface";
import { LogMessage } from "../interfaces/log-message.interface";
import { LogTransport } from "../interfaces/log-transport.interface";

// colour?

export class ConsoleTransport implements LogTransport {

  logLevel: LogLevel;

  useColour?: boolean;

  constructor(settings?: {
    logLevel?: LogLevel,
    useColour?: boolean,
  }) {
    this.logLevel = settings?.logLevel ?? LogLevels.log;

    this.useColour = settings?.useColour;
  }
  
  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

}
