import { NestLogger, LogManager, LogLevels } from "../../src";

describe("nest logger", () => {

  let manager: LogManager;

  beforeEach(() => {
    manager = new LogManager();
  });

  it("can be created", () => {
    const logger = new NestLogger();
    expect(logger).toBeDefined();
  });

  it("has a default context", () => {
    const logger = new NestLogger();
    expect(logger.context).toBe("Nest");
  });

  it("can have a custom context", () => {
    const context = "NestApplication";
    const logger = new NestLogger(context);
    expect(logger.context).toBe(context);
  });

  it("uses last parameter as context when multiple parameters", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Test message", "CustomContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("CustomContext");
    expect(logMessage.message).toBe("Test message");
  });

  it("uses default context when single parameter", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Test message");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("DefaultContext");
    expect(logMessage.message).toBe("Test message");
  });

  it("uses default context when last parameter is not a string", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Test message", 123);

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("DefaultContext");
    expect(logMessage.message).toContain("Test message");
    expect(logMessage.message).toContain("123");
  });

  it("combines multiple message parts before context", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Part 1", "Part 2", "Part 3", "CustomContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("CustomContext");
    expect(logMessage.message).toContain("Part 1");
    expect(logMessage.message).toContain("Part 2");
    expect(logMessage.message).toContain("Part 3");
  });

  it("logs at error level", () => {
    const logger = new NestLogger();
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.error("Error message", "ErrorContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.level).toBe(LogLevels.error);
    expect(logMessage.context).toBe("ErrorContext");
  });

  it("logs at warn level", () => {
    const logger = new NestLogger();
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.warn("Warning message", "WarnContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.level).toBe(LogLevels.warn);
    expect(logMessage.context).toBe("WarnContext");
  });

  it("logs at log level", () => {
    const logger = new NestLogger();
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Log message", "LogContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.level).toBe(LogLevels.log);
    expect(logMessage.context).toBe("LogContext");
  });

  it("logs at debug level", () => {
    const logger = new NestLogger();
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.debug("Debug message", "DebugContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.level).toBe(LogLevels.debug);
    expect(logMessage.context).toBe("DebugContext");
  });

  it("logs at verbose level", () => {
    const logger = new NestLogger();
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.verbose,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.verbose("Verbose message", "VerboseContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.level).toBe(LogLevels.verbose);
    expect(logMessage.context).toBe("VerboseContext");
  });

  it("respects logger min level", () => {
    const logger = new NestLogger();
    logger.minLevel = LogLevels.warn;
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.debug("Debug message");
    logger.log("Log message");
    logger.warn("Warn message");
    logger.error("Error message");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(2);
    expect(mockSink.handleMessage.mock.calls[0][0].level).toBe(LogLevels.warn);
    expect(mockSink.handleMessage.mock.calls[1][0].level).toBe(LogLevels.error);
  });

  it("does not log when not registered with manager", () => {
    const logger = new NestLogger();

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    logger.log("Test message");

    expect(mockSink.handleMessage).not.toHaveBeenCalled();
  });

  it("handles objects in message", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    const obj = { key: "value", nested: { data: 123 } };
    logger.log("Object:", obj, "CustomContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("CustomContext");
    expect(logMessage.message).toContain("Object:");
    expect(logMessage.message).toContain("key");
    expect(logMessage.message).toContain("value");
  });

  it("handles errors in message", () => {
    const logger = new NestLogger("DefaultContext");
    manager.addLogger(logger);

    const mockSink = {
      name: "MockSink",
      minLevel: LogLevels.debug,
      handleMessage: jest.fn(),
      destroy: jest.fn(),
    };
    manager.addSink(mockSink);

    const error = new Error("Test error");
    logger.error(error, "ErrorContext");

    expect(mockSink.handleMessage).toHaveBeenCalledTimes(1);
    const logMessage = mockSink.handleMessage.mock.calls[0][0];
    expect(logMessage.context).toBe("ErrorContext");
    expect(logMessage.message).toContain("Test error");
  });

});
