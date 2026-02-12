import fetch from "node-fetch";
import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

export class WebhookSink implements LogSink {

  name: string = this.constructor.name;
  minLevel: LogLevel = LogLevels.warn;

  private url: string;
  private method: string;
  private headers: { [key: string]: string };
  private buildBody: (logMessage: LogMessage) => object;
  private onError?: (error: Error) => void;

  constructor(settings: {
    name?: string,
    minLevel?: LogLevel,

    /** The URL to which to send the request */
    url: string,
    /**
     * Specify a different HTTP method
     * @default "POST"
     */
    method?: string,
    /** Any additional headers to include with the request */
    headers?: { [key: string]: string },
    /** Optionally override the function building the request body */
    buildBody?: (logMessage: LogMessage) => object,
    /** Optional error handler for failed webhook requests */
    onError?: (error: Error) => void,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.minLevel) this.minLevel = settings.minLevel;

    this.url = settings.url;
    this.method = settings.method ?? "POST";
    this.headers = settings.headers ?? {};
    this.buildBody = settings.buildBody ?? this.defaultBuildBody;
    this.onError = settings.onError;
  }

  private defaultBuildBody(logMessage: LogMessage): object {
    return {
      level: logMessage.level,
      context: logMessage.context,
      message: logMessage.message,
      timestamp: logMessage.timestamp.toISOString(),
      deviceId: logMessage.deviceId,
      deviceName: logMessage.deviceName,
      processId: logMessage.processId,
    };
  }

  handleMessage(logMessage: LogMessage) {
    const body = this.buildBody(logMessage);

    // Send webhook asynchronously without blocking
    fetch(this.url, {
      method: this.method,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify(body),
    }).catch((error) => {
      if (this.onError) {
        this.onError(error);
      } else {
        // Silently fail to avoid crashing the application
        console.error(`WebhookSink error for ${this.name}:`, error.message);
      }
    });
  }

  destroy() {
    // No cleanup needed for webhook sink
  }

}
