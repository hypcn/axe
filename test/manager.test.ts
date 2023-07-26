import { logMgr, LogManager, CONSOLE_SINK, ConsoleSink, Logger, LogLevels, LogMessage } from "../src";

describe("manager", () => {

  it("exports a default instance", () => {
    expect(logMgr).toBeDefined();
  });

  it("has a ConsoleSink on the default manager instance", () => {
    expect(logMgr.findSink(ConsoleSink)).toBeDefined();
  });

  it("can be created", () => {
    const manager = new LogManager({});
    expect(manager).toBeDefined();
  });

  it("can be created with a default ConsoleSink", () => {
    const manager = new LogManager({
      withDefaultConsoleSink: true,
    });
    expect(manager.findSink(ConsoleSink)).toBeDefined();
  });

  it("has the correct default name for the default ConsoleSink", () => {
    const manager = new LogManager({
      withDefaultConsoleSink: true,
    });
    expect(manager.findSink(ConsoleSink)!.name).toBe(CONSOLE_SINK);
  });

  it("can create a logger", () => {
    const manager = new LogManager();
    let count = manager.loggerCount;
    manager.createLogger();
    expect(manager.loggerCount).toBe(count + 1);
  });

  it("can add an existing logger", () => {
    const manager = new LogManager();
    let count = manager.loggerCount;

    const logger = new Logger();
    manager.addLogger(logger);

    expect(manager.loggerCount).toBe(count + 1);
    expect(logger._manager).toBe(manager);
  });

  it("can remove a logger", () => {
    const manager = new LogManager();
    let count = manager.loggerCount;

    const logger = new Logger();
    manager.addLogger(logger);

    manager.removeLogger(logger)

    expect(manager.loggerCount).toBe(count);
    expect(logger._manager).toBe(undefined);
  });

  it("can add a sink", () => {
    const manager = new LogManager();
    let count = manager.sinkCount;

    const sink = new ConsoleSink({});
    manager.addSink(sink);

    expect(manager.sinkCount).toBe(count + 1);
    expect(() => manager.addSink(sink)).toThrow();
  });

  it("can remove sinks", () => {
    const manager = new LogManager();
    let count = manager.sinkCount;

    const sink = new ConsoleSink({});
    const sink2Name = "console sink 2";
    const sink2 = new ConsoleSink({ name: sink2Name });

    manager.addSink(sink);
    manager.addSink(sink2);
    expect(manager.sinkCount).toBe(2);

    manager.removeSink(sink);
    expect(manager.sinkCount).toBe(1);

    manager.removeSinkByName(sink2Name);
    expect(manager.sinkCount).toBe(0);
  });

  it("can remove all sinks", () => {
    const manager = new LogManager();

    const sink1 = new ConsoleSink({ name: "1" });
    const sink2 = new ConsoleSink({ name: "2" });
    const sink3 = new ConsoleSink({ name: "3" });
    manager.addSink(sink1);
    manager.addSink(sink2);
    manager.addSink(sink3);
    expect(manager.sinkCount).toBe(3);

    manager.removeAllSinks();
    expect(manager.sinkCount).toBe(0);
  });

  it("can find a sink", () => {
    const manager = new LogManager();

    const sink1 = new ConsoleSink({ name: "1" });
    const sink2 = new ConsoleSink({ name: "2" });
    const sink3 = new ConsoleSink({ name: "3" });
    manager.addSink(sink1);
    manager.addSink(sink2);
    manager.addSink(sink3);

    expect(manager.findSink(ConsoleSink)).toBe(sink1);
    expect(manager.findSinkByName("2")).toBe(sink2);
  });

  it("can set a sink filter", () => {
    const manager = new LogManager();

    const name = "sink";
    const sink = new ConsoleSink({ name });
    manager.addSink(sink);
    const level = LogLevels.error;
    manager.setSinkFilter(name, level);

    expect(sink.logFilter).toBe(level);
  });

  it("can set a sink filter", () => {
    const manager = new LogManager();

    const sink1 = new ConsoleSink({ name: "one" });
    const sink2 = new ConsoleSink({ name: "two" });
    manager.addSink(sink1);
    manager.addSink(sink2);
    sink1.logFilter = LogLevels.verbose;
    sink2.logFilter = LogLevels.warn;

    expect(manager.readSinkFilters()).toMatchObject({
      one: LogLevels.verbose,
      two: LogLevels.warn,
    });
  });

  it("can build log messages", () => {
    const manager = new LogManager();

    const msg1 = manager.buildLogMessage({});
    expect(msg1.context).toBe(manager.commonContext);
    expect(msg1.deviceId).toBe(manager.commonDeviceId);
    expect(msg1.deviceName).toBe(manager.commonDeviceName);
    expect(msg1.level).toBe(manager.commonLogLevel);
    expect(msg1.message).toBe("");
    expect(msg1.processId).toBe(manager.commonProcessId);
    expect(msg1.timestamp).toBeInstanceOf(Date);

    const date = new Date();
    const msg2 = manager.buildLogMessage({
      context: "context",
      deviceId: "deviceId",
      deviceName: "deviceName",
      level: LogLevels.error,
      message: "message",
      processId: "processId",
      timestamp: date,
    });
    expect(msg2.context).toBe("context");
    expect(msg2.deviceId).toBe("deviceId");
    expect(msg2.deviceName).toBe("deviceName");
    expect(msg2.level).toBe(LogLevels.error);
    expect(msg2.message).toBe("message");
    expect(msg2.processId).toBe("processId");
    expect(msg2.timestamp).toBe(date);

  });

  it("can handle log messages", () => {
    const manager = new LogManager();

    return new Promise<void>((resolve, reject) => {

      const message: LogMessage = {
        timestamp: new Date(),
        level: LogLevels.log,
        context: "context",
        message: "message",
      };

      manager.addSink({
        name: "sink",
        logFilter: LogLevels.log,
        handleMessage: (msg) => {
          expect(message).toBe(msg);
          resolve();
        },
        destroy: () => { },
      });

      manager.handleLogMessage(message);

    });
  });

  it("can build and handle log messages", () => {
    const manager = new LogManager();

    return new Promise<void>((resolve, reject) => {

      manager.addSink({
        name: "sink",
        logFilter: LogLevels.log,
        handleMessage: (msg) => {
          expect(msg.context).toBe(manager.commonContext);
          expect(msg.deviceId).toBe(manager.commonDeviceId);
          expect(msg.deviceName).toBe(manager.commonDeviceName);
          expect(msg.level).toBe(manager.commonLogLevel);
          expect(msg.message).toBe("");
          expect(msg.processId).toBe(manager.commonProcessId);
          expect(msg.timestamp).toBeInstanceOf(Date);
          resolve();
        },
        destroy: () => { },
      });

      manager.buildAndHandleLogMessage({
        // empty
      });

    });
  });

  it("can determine if a log level satisfies a filter", () => {
    const manager = new LogManager();

    expect(manager.logLevelSatisfiesFilter(LogLevels.log, LogLevels.log)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.log, LogLevels.debug)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.log, LogLevels.verbose)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.log, LogLevels.warn)).toBe(false);
    expect(manager.logLevelSatisfiesFilter(LogLevels.log, LogLevels.error)).toBe(false);

    expect(manager.logLevelSatisfiesFilter(LogLevels.verbose, LogLevels.verbose)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.verbose, LogLevels.log)).toBe(false);
    expect(manager.logLevelSatisfiesFilter(LogLevels.verbose, LogLevels.error)).toBe(false);

    expect(manager.logLevelSatisfiesFilter(LogLevels.error, LogLevels.verbose)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.error, LogLevels.log)).toBe(true);
    expect(manager.logLevelSatisfiesFilter(LogLevels.error, LogLevels.error)).toBe(true);
  });

});
