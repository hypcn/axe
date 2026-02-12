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

  // Edge case tests
  it("handles null values", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("null");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(null);

    });
  });

  it("handles undefined values", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("undefined");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(undefined);

    });
  });

  it("handles Error objects", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toContain("Error: Test error");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(new Error("Test error"));

    });
  });

  it("handles nested objects", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toContain("level1");
          expect(msg.message).toContain("level2");
          expect(msg.message).toContain("deep");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log({
        level1: {
          level2: {
            deep: "value"
          }
        }
      });

    });
  });

  it("handles arrays with mixed types", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toContain("1");
          expect(msg.message).toContain("string");
          expect(msg.message).toContain("true");
          expect(msg.message).toContain("null");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log([1, "string", true, null, undefined]);

    });
  });

  it("handles circular references", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          // Should not crash, message should contain something
          expect(msg.message).toBeDefined();
          expect(msg.message.length).toBeGreaterThan(0);
          resolve();
        },
      });

      const logger = manager.createLogger();
      const obj: any = { a: 1 };
      obj.self = obj;
      logger.log(obj);

    });
  });

  it("handles empty string", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log("");

    });
  });

  it("handles no arguments", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log();

    });
  });

  it("handles boolean values", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("true false");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(true, false);

    });
  });

  it("handles numbers", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message).toBe("0 -1 3.14 Infinity -Infinity NaN");
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log(0, -1, 3.14, Infinity, -Infinity, NaN);

    });
  });

  it("handles very long strings", () => {
    return new Promise<void>((resolve, reject) => {

      const manager = new LogManager();
      manager.addSink({
        name: "sink",
        minLevel: LogLevels.log,
        destroy: () => { },
        handleMessage: (msg) => {
          expect(msg.message.length).toBe(10000);
          resolve();
        },
      });

      const logger = manager.createLogger();
      logger.log("a".repeat(10000));

    });
  });

});

