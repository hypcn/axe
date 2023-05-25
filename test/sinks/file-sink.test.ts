import { join } from "path";
import { FileSink, LogLevels } from "../../src";
import { readFile } from "fs/promises";
import { wait } from "@hypericon/utils";
import { rmSync } from "fs";

const testLogDirPath = join(process.cwd(), "__log-test");

describe("file sink", () => {

  afterAll(() => {
    rmSync(testLogDirPath, {
      force: true,
      recursive: true,
    });
  });

  it("can be created", () => {
    const sink = new FileSink({ logDirPath: testLogDirPath });
    expect(sink).toBeDefined();
    sink.destroy();
  });

  it("has a default name", () => {
    const sink = new FileSink({ logDirPath: testLogDirPath });
    expect(sink.name).toBe(FileSink.name);
    sink.destroy();
  });

  it("can be named", () => {
    const name = "sink";
    const sink = new FileSink({
      name,
      logDirPath: testLogDirPath,
    });
    expect(sink.name).toBe(name);
    sink.destroy();
  });

  it("has a default log filter", () => {
    const sink = new FileSink({ logDirPath: testLogDirPath });
    expect(sink.logFilter).toBeDefined();
    sink.destroy();
  });

  it("can have a custom log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new FileSink({
      logFilter,
      logDirPath: testLogDirPath,
    });
    expect(sink.logFilter).toBe(logFilter);
    sink.destroy();
  });

  it("can change log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new FileSink({ logDirPath: testLogDirPath });
    sink.logFilter = logFilter;
    expect(sink.logFilter).toBe(logFilter);
    sink.destroy();
  });

  // it("has a default dir path", () => {
  //   const sink = new FileSink({ });
  //   const dirPath = join(process.cwd(), "logs");
  //   expect((sink as any).logDirPath).toBe(dirPath);
  // });

  it("can have a custom dir path", () => {
    // const customPath = "/somewhere/else";
    const sink = new FileSink({
      logDirPath: testLogDirPath,
    });
    expect((sink as any).logDirPath).toBe(testLogDirPath);
    sink.destroy();
  });

  it("has a default filename function", () => {
    const sink = new FileSink({ logDirPath: testLogDirPath });
    const logFilename = (sink as any).logFilenameFn();
    expect(typeof logFilename).toBe("string");
    sink.destroy();
  });

  it("can have a custom filename function", () => {
    const logFilenameFn = () => {
      return "filename.txt";
    };
    const sink = new FileSink({
      logFilenameFn,
      logDirPath: testLogDirPath,
    });
    expect((sink as any).logFilenameFn).toBe(logFilenameFn);
    sink.destroy();
  });

  it("logs handled messages to the file", async () => {

    const filename = "__test-log-file.txt";

    const sink = new FileSink({
      logFilenameFn: () => filename,
      logDirPath: testLogDirPath,
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

    const filePath = join(testLogDirPath, filename);
    const fileString = await readFile(filePath, { encoding: "utf-8" });
    const fileLines = fileString
      .split("\n")
      .filter(l => Boolean(l))
      .length;

    // rmSync(logDirPath, {
    //   force: true,
    //   recursive: true,
    // });

    expect(fileLines).toBe(count);

  });

});
