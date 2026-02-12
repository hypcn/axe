import { ConsoleSink, LogLevels } from "../../src";

describe("console sink", () => {

  it("can be created", () => {
    const sink = new ConsoleSink({});
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new ConsoleSink({ });
    expect(sink.name).toBe(ConsoleSink.name);
  });

  it("can be named", () => {
    const name = "Console Sink";
    const sink = new ConsoleSink({ name });
    expect(sink.name).toBe(name);
  });

  it("has a default min level", () => {
    const sink = new ConsoleSink({ });
    expect(sink.minLevel).toBeDefined();
  });

  it("can have a custom min level", () => {
    const minLevel = LogLevels.error;
    const sink = new ConsoleSink({ minLevel });
    expect(sink.minLevel).toBe(minLevel);
  });

  it("can change min level", () => {
    const minLevel = LogLevels.error;
    const sink = new ConsoleSink({ });
    sink.minLevel = minLevel;
    expect(sink.minLevel).toBe(minLevel);
  });

  it("logs handled messages to the console", () => {
    return new Promise<void>((resolve, reject) => {
      
      const CONSOLE_LOG = global.console.log;
      global.console.log = (msg) => {
        global.console.log = CONSOLE_LOG;
        resolve();
      };
      
      const sink = new ConsoleSink({ });
      sink.handleMessage({
        context: "context",
        message: "log",
        level: LogLevels.log,
        timestamp: new Date(),
      });
      
    });
  });

});
