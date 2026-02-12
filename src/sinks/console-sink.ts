import chalk from "chalk";
import { LogLevel, LogLevelNameLeft, LogLevels } from "../interfaces";
import { LogMessage } from "../interfaces/log-message.interface";
import { LogSink } from "../interfaces/log-sink.interface";

const LOG_LEVEL_COLOUR_FNS = {
  [LogLevels.none]: chalk.bgRedBright,
  [LogLevels.error]: chalk.red,
  [LogLevels.warn]: chalk.yellow,
  [LogLevels.log]: chalk.blue,
  [LogLevels.debug]: chalk.magenta,
  [LogLevels.verbose]: chalk.gray,
} as const;

const CONTEXT_COLOUR_FN = chalk.yellow;

export class ConsoleSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.debug;

  noColour?: boolean;
  noTimestamp?: boolean;
  noLevel?: boolean;
  noContext?: boolean;

  private onError?: (error: Error) => void;

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

    noColour?: boolean,
    noTimestamp?: boolean,
    noLevel?: boolean,
    noContext?: boolean,
    /** Optional error handler */
    onError?: (error: Error) => void,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;

    this.noColour = settings.noColour;
    this.noTimestamp = settings.noTimestamp;
    this.noContext = settings.noContext;
    this.noLevel = settings.noLevel;
    this.onError = settings.onError;
  }
  
  handleMessage(logMessage: LogMessage) {
    try {
      const parts: string[] = [];

      // Add timestamp if not disabled
      if (!this.noTimestamp) {
        parts.push(`[${logMessage.timestamp.toISOString()}]`);
      }

      // Add log level if not disabled
      if (!this.noLevel) {
        const levelText = LogLevelNameLeft[logMessage.level];
        parts.push(this.noColour ? levelText : LOG_LEVEL_COLOUR_FNS[logMessage.level](levelText));
      }

      // Add context if not disabled
      if (!this.noContext) {
        const contextText = `[${logMessage.context}]`;
        parts.push(this.noColour ? contextText : CONTEXT_COLOUR_FN(contextText));
      }

      // Add message (always included)
      const messageText = logMessage.message;
      parts.push(this.noColour ? messageText : LOG_LEVEL_COLOUR_FNS[logMessage.level](messageText));

      console.log(parts.join("  "));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) {
        this.onError(err);
      } else {
        // Last resort - use console.error directly
        console.error(`ConsoleSink error for ${this.name}:`, err.message);
      }
    }
  }

  destroy() {
    // noop
  }

}
