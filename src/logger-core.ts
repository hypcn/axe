import { inspect } from "util";
import { LogLevel, LogMessage, LogTransport } from "./interfaces";
import { ConsoleTransport } from "./transports";
import { Logger } from "./logger";

const isProd = process.env.NODE_ENV === "production";

export class LoggerCore {

  // static commonSettings = {  };
  static commonContext: string = "";
  static commonLogLevel: LogLevel = "log";

  static commonDeviceId: string | undefined;
  static commonDeviceName: string | undefined;
  static commonProcessId: string = process.pid.toString();

  static commonTransports: LogTransport[] = [
    new ConsoleTransport({
      logLevel: isProd ? "log" : "debug",
      useColour: isProd ? false : true,
    }),
  ];

  /**
   * Weak references to Logger instances, to make them available for centralised transport and
   * log level configuration via API
   */
  static instances = new WeakSet<Logger>();

  static buildMessageString(...msgs: any[]): string {

    // console.log("build message string from:", msgs);
    if (msgs.length === 0) return "";

    return msgs.map(msg => {
      if (msg === null) return "null";
      if (msg === undefined) return "undefined";
      if (typeof msg === "object") inspect(msg);
      return msg.toString();
    }).join(" ");

  }

  static buildLogMessage(partalMsg: Partial<LogMessage>): LogMessage {

    return {
      context: partalMsg.context ?? this.commonContext,
      level: partalMsg.level ?? "log",
      message: partalMsg.message ?? "",
      timestamp: partalMsg.timestamp ?? new Date(),

      deviceId: partalMsg.deviceId,
      deviceName: partalMsg.deviceName,
      processId: partalMsg.processId ?? this.commonProcessId,
    };

  }

  static transportLogMessage(message: LogMessage, transports: LogTransport[] | undefined) {

    transports = transports ?? this.commonTransports;

    for (const transport of transports) {
      transport.logLevel
    }

  }

  static buildLogMessageAndTransport(partialMsg: Partial<LogMessage>, transports: LogTransport[] | undefined) {
    return this.transportLogMessage(this.buildLogMessage(partialMsg), transports);
  }

}
