import { join } from "path";
import { FileSink, LogLevels } from "../../src";
import { readFile } from "fs/promises";
import { wait } from "@hypericon/utils";
import { rmSync } from "fs";

describe("file sink", () => {

  it("can be created", () => {
    const sink = new FileSink({});
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new FileSink({ });
    expect(sink.name).toBe(FileSink.name);
  });

  it("can be named", () => {
    const name = "sink";
    const sink = new FileSink({ name });
    expect(sink.name).toBe(name);
  });

  it("has a default log filter", () => {
    const sink = new FileSink({ });
    expect(sink.logFilter).toBeDefined();
  });

  it("can have a custom log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new FileSink({ logFilter });
    expect(sink.logFilter).toBe(logFilter);
  });

  it("can change log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new FileSink({ });
    sink.logFilter = logFilter;
    expect(sink.logFilter).toBe(logFilter);
  });

  it("has a default dir path", () => {
    const sink = new FileSink({ });
    const dirPath = join(process.cwd(), "logs");
    expect((sink as any).logDirPath).toBe(dirPath);
  });

  it("can have a custom dir path", () => {
    const customPath = "/somewhere/else";
    const sink = new FileSink({
      logDirPath: customPath,
    });
    expect((sink as any).logDirPath).toBe(customPath);
  });

  it("has a default filename function", () => {
    const sink = new FileSink({ });
    const logFilename = (sink as any).logFilenameFn();
    expect(typeof logFilename).toBe("string");
  });

  it("can have a custom filename function", () => {
    const logFilenameFn = () => {
      return "filename.txt";
    };
    const sink = new FileSink({
      logFilenameFn,
    });
    expect((sink as any).logFilenameFn).toBe(logFilenameFn);
  });

  it("logs handled messages to the file", async () => {

    const filename = "__test-log-file.txt";
    const logDirPath = join(process.cwd(), "__log-test");

    const sink = new FileSink({
      logDirPath,
      logFilenameFn: () => filename,
    });

    const waitMs = 100;
    await wait(waitMs);

    const count = 5;

    for (let i = 0; i < count; i++) {
      sink.handleMessage({
        timestamp: new Date(),
        context: "ctx",
        level: LogLevels.log,
        message: "log",
      });
    }

    await wait(waitMs);

    sink.destroy();

    const filePath = join(logDirPath, filename);
    const fileString = await readFile(filePath, { encoding: "utf-8" });
    const fileLines = fileString
      .split("\n")
      .filter(l => Boolean(l))
      .length;

    rmSync(logDirPath, {
      force: true,
      recursive: true,
    });

    expect(fileLines).toBe(count);

  });

});
