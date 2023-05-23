import chalk from "chalk";
import { LogLevelNameLeft, LogLevels } from "../interfaces";
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

  noColour?: boolean;
  noTimestamp?: boolean;
  noLevel?: boolean;
  noContext?: boolean;

  constructor(settings?: {
    noColour?: boolean,
    noTimestamp?: boolean,
    noLevel?: boolean,
    noContext?: boolean,
  }) {
    this.noColour = settings?.noColour;
    this.noTimestamp = settings?.noTimestamp;
    this.noContext = settings?.noContext;
    this.noLevel = settings?.noLevel;
  }
  
  handleMessage(logMessage: LogMessage) {

    console.log([
      `[${logMessage.timestamp.toISOString()}]`,
      LOG_LEVEL_COLOUR_FNS[logMessage.level](LogLevelNameLeft[logMessage.level]),
      CONTEXT_COLOUR_FN(`[${logMessage.context}]`),
      LOG_LEVEL_COLOUR_FNS[logMessage.level](logMessage.message),
    ].join("  "));

  }

  destroy() {
    // noop
  }

}
