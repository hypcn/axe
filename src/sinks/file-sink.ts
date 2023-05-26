import { join } from "path";
import { LogLevel, LogLevelNameLeft, LogLevels, LogMessage, LogSink } from "../interfaces";
import { WriteStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { readdir, readFile, stat } from 'fs/promises';

// default filename template?
// path?

// method to delete older than?

const DEBUG = false;

export interface LogFileInfo {
  filename: string,
  /** In bytes */
  size: number,
  /** Created time as epoch milliseconds */
  created: number,
  /** Modified time as epoch milliseconds */
  modified: number,
}

export class FileSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.log;

  private logDirPath = join(process.cwd(), "logs");
  private logFilenameFn: (() => string) = () => {
    const logDate = new Date().toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "_");
    const logFileName = `${logDate}.txt`;
    return logFileName;
  };
  private logStream: WriteStream | undefined;
  private streamReady = false;
  private lineBuffer: string[] = [];

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

    /**
     * Full path to the dir containing the log files
     * @default join(process.cwd(), "logs")
     */
    logDirPath?: string,
    /**
     * Function to build the filenames for new log files.
     * 
     * @default
     * () => {
     *   const logDate = new Date().toISOString()
     *     .replace(/:/g, "-")
     *     .replace(/\./g, "_");
     *   const logFileName = `${logDate}.txt`;
     *   return logFileName;
     *   // example: "2023-01-31T10-35-12_345Z.txt"
     * }
     */
    logFilenameFn?: () => string,

    /**
     * By default, a new log file is created when the sink is.
     * Set this flag to `true` to disable this behaviour. A new file must
     * then be opened manually.
     */
    noOpenOnCreate?: boolean,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;

    if (settings.logDirPath) this.logDirPath = settings.logDirPath;
    if (settings.logFilenameFn) this.logFilenameFn = settings.logFilenameFn;

    if (settings.noOpenOnCreate !== false) {
      this.openNewFile();
    }
  }

  handleMessage(logMessage: LogMessage) {
    
    const line = [
      logMessage.timestamp.toISOString(),
      LogLevelNameLeft[logMessage.level],
      `[${logMessage.context}]`,
      logMessage.message,
    ].join("  ");

    this.writeLine(line);

  }

  destroy() {
    this.logStream?.end();
  }

  openNewFile() {

    this.ensureLogDir();

    this.streamReady = false;

    // Close the existing stream
    this.logStream?.end();

    // Open a new one
    this.openLogStream();

  }

  async listLogFiles(): Promise<{ logFiles: LogFileInfo[] }> {

    const logDirContents = await readdir(this.logDirPath);

    const fileInfo: LogFileInfo[] = [];
    for await (const file of logDirContents) {
      const stats = await stat(join(this.logDirPath, file));
      fileInfo.push({
        filename: file,
        size: stats.size,
        created: stats.birthtimeMs,
        modified: stats.mtimeMs,
      });
    }

    return {
      logFiles: fileInfo,
    };
  }

  async readLogFile(filename: string): Promise<{ filename: string, contents: string }> {

    const readPath = join(this.logDirPath, filename);

    const contents = await readFile(readPath, { encoding: "utf8" });

    return {
      filename,
      contents,
    };
  }

  private ensureLogDir() {
    if (!existsSync(this.logDirPath)) {
      mkdirSync(this.logDirPath, { recursive: true });
    }
  }

  private openLogStream() {
    this.streamReady = false;

    // const logDate = new Date().toISOString()
    //   .replace(/:/g, "-")
    //   .replace(/\./g, "_");
    // const logFileName = `${logDate}.txt`;
    const logFileName = this.logFilenameFn();
    const logFilePath = join(this.logDirPath, logFileName);

    DEBUG && console.log(`Opening log file: ${logFileName}`);
    DEBUG && console.log(`Opening log file: ${logFilePath}`);

    this.logStream = createWriteStream(logFilePath, {
      encoding: "utf-8",
      flags: "a",
    });

    this.logStream.on("close", () => {
      // CONSOLE && console.log(`log stream event: CLOSE`);
      this.streamReady = false;
    });
    this.logStream.on("error", (err) => {
      // CONSOLE && console.log(`log stream event: ERROR`);
      this.streamReady = false;
    });
    this.logStream.on("ready", () => {
      // CONSOLE && console.log(`log stream event: READY`);
      this.streamReady = true;
    });

    // this.logStream.on("drain", () => { CONSOLE && console.log(`log stream event: DRAIN`); });
    // this.logStream.on("finish", () => { CONSOLE && console.log(`log stream event: FINISH`); });
    // this.logStream.on("open", (fd) => { CONSOLE && console.log(`log stream event: OPEN`); });
    // this.logStream.on("pipe", (src) => { CONSOLE && console.log(`log stream event: PIPE`); });
    // this.logStream.on("unpipe", (src) => { CONSOLE && console.log(`log stream event: UNPIPE`); });

  }

  private writeLine(line: string) {
    line = line.endsWith("\n") ? line : line + "\n";

    // It the stream is not ready, buffer the line
    if (!this.logStream || !this.streamReady) {

      DEBUG && console.log(`Buffering line: ${line}`);
      this.lineBuffer.push(line);

      // If a stream has not been opened, open it
      if (!this.logStream) {
        this.openLogStream();
      }

      return;
    }

    while (this.lineBuffer.length > 0) {
      const buffered = this.lineBuffer.splice(0, 1)[0];
      DEBUG && console.log(`Writing buffered line: ${buffered}`);
      this.logStream.write(buffered);
    }

    DEBUG && console.log(`Writing line: ${line}`);
    this.logStream.write(line);

  }

}
