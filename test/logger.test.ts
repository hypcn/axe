import { LogManager, LogLevels, Logger } from "../src";

describe("logger", () => {

  it("can be created", () => {
    expect(new Logger()).toBeDefined();
  });

  it("has a context", () => {
    const ctx = "My Context";
    const logger = new Logger(ctx);
    expect(logger.context).toBe(ctx);
  });

  it("can log errors", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.error);
          expect(msg.message).toBe("error");
          resolve();
        },
      })

      const logger = manager.createLogger();
      logger.error("error");

    });
  });

  it("can log warnings", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.warn);
          expect(msg.message).toBe("warn");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.warn("warn");

    });
  });

  it("can filter out warnings", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.error,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.error);
          expect(msg.message).toBe("error");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.warn("warn");
      logger.error("error");

    });
  });

  it("can log log messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.log);
          expect(msg.message).toBe("log");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log("log");

    });
  });

  it("can filter out log messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.error,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.error);
          expect(msg.message).toBe("error");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log("log");
      logger.error("error");

    });
  });

  it("can log debug messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.debug,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.debug);
          expect(msg.message).toBe("debug");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.debug("debug");

    });
  });

  it("can filter out debug messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.error,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.error);
          expect(msg.message).toBe("error");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.debug("debug");
      logger.error("error");

    });
  });

  it("can log verbose messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.verbose,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.verbose);
          expect(msg.message).toBe("verbose");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.verbose("verbose");

    });
  });

  it("can filter out verbose messages", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.error,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.error);
          expect(msg.message).toBe("error");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.verbose("verbose");
      logger.error("error");

    });
  });

  it("can build message strings", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe(`string { an: 'object' } [ 1, 2, 3 ]`);
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(
        "string",
        { an: "object" },
        [1, 2, 3],
      );

    });
  });

  it("does not have a default min level", () => {

    const manager = new LogManager();
    const logger = manager.createLogger();

    expect(logger.minLevel).toBeUndefined();

  });

  it("applies the configured min level", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.verbose, // no sink filtering
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.level).toBe(LogLevels.log);
          expect(msg.message).toBe("log");
          resolve();
        },
      })

      const logger = manager.createLogger();
      logger.minLevel = LogLevels.log; // Logger min level filtering
      logger.verbose("verbose");
      logger.log("log");

    });
  });

});
