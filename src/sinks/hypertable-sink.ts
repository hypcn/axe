import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";
import fetch from "node-fetch";

interface RecordFieldKeys {
  timestamp: string,
  logLevel: string,
  context: string,
  message: string,
  deviceId: string,
  deviceName: string,
  processId: string,
}

export class HypertableSink implements LogSink {

  // private logger: Logger

  name: string = this.constructor.name;
  minLevel: LogLevel = LogLevels.warn;

  baseUrl = "https://hypertable.cloud";
  apiKey: string;
  projectId: string;
  collectionId: string;

  fieldKeys: RecordFieldKeys = {
    timestamp: "timestamp",
    logLevel: "level",
    context: "context",
    message: "message",
    deviceId: "deviceId",
    deviceName: "deviceName",
    processId: "processId",
  };

  private onError?: (error: Error) => void;

  constructor(settings: {
    name?: string,
    minLevel?: LogLevel,

    /** Hypertable API key with permission to create a Record */
    apiKey: string,
    /** The ID of the Project in which to create the new Record */
    projectId: string,
    /** The ID of the Collection in which to create the new Record */
    collectionId: string,
    /** Optionally override the Hypertable base URL */
    baseUrl?: string,
    /** Optionally override the field keys within the created Record */
    fieldKeys?: Partial<RecordFieldKeys>,
    /** Optional error handler for failed requests */
    onError?: (error: Error) => void,
  }) {

    if (settings.name) this.name = settings.name;
    if (settings.minLevel) this.minLevel = settings.minLevel;

    this.apiKey = settings.apiKey;
    this.projectId = settings.projectId;
    this.collectionId = settings.collectionId;
    if (settings.baseUrl) this.baseUrl = settings.baseUrl;
    this.onError = settings.onError;

    if (settings.fieldKeys) {
      if (settings.fieldKeys.timestamp) this.fieldKeys.timestamp = settings.fieldKeys.timestamp;
      if (settings.fieldKeys.logLevel) this.fieldKeys.logLevel = settings.fieldKeys.logLevel;
      if (settings.fieldKeys.context) this.fieldKeys.context = settings.fieldKeys.context;
      if (settings.fieldKeys.message) this.fieldKeys.message = settings.fieldKeys.message;
      if (settings.fieldKeys.deviceId) this.fieldKeys.deviceId = settings.fieldKeys.deviceId;
      if (settings.fieldKeys.deviceName) this.fieldKeys.deviceName = settings.fieldKeys.deviceName;
      if (settings.fieldKeys.processId) this.fieldKeys.processId = settings.fieldKeys.processId;
    }

  }

  async handleMessage(log: LogMessage) {

    const url = `${this.baseUrl}/api/v1/data/projects/${this.projectId}/collections/${this.collectionId}/records`;

    const body = {
      values: {
        [this.fieldKeys.deviceId]: log.deviceId ?? "",
        [this.fieldKeys.deviceName]: log.deviceName ?? "",
        [this.fieldKeys.timestamp]: log.timestamp.toISOString(),
        [this.fieldKeys.logLevel]: log.level,
        [this.fieldKeys.context]: log.context,
        [this.fieldKeys.message]: log.message,
        [this.fieldKeys.processId]: log.processId ?? "",
      },
    };

    // console.log(`Upload body:`, body);

    // Send request asynchronously without blocking
    fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(error => {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) {
        this.onError(err);
      } else {
        console.error(`HypertableSink error for ${this.name}:`, err.message);
      }
    });

  }

  destroy() {
    // anything?
  }

}
