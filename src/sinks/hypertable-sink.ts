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
  logFilter: LogLevel = LogLevels.warn;

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

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

    apiKey: string,
    projectId: string,
    collectionId: string,
    baseUrl?: string,
    fieldKeys?: Partial<RecordFieldKeys>,
  }) {

    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;

    this.apiKey = settings.apiKey;
    this.projectId = settings.projectId;
    this.collectionId = settings.collectionId;
    if (settings.baseUrl) this.baseUrl = settings.baseUrl;

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

  handleMessage(logMessage: LogMessage) {

    throw new Error("Method not implemented.");

  }

  async uploadLog(log: LogMessage) {

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

    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then(res => {
      return res;
    }).catch(error => {
      // this.logger.error(`Error uploading cloud log:`, error); // TODO
      console.error(`Error uploading cloud log:`, error);
    });

  }

  destroy() {
    // anything?
  }

}
