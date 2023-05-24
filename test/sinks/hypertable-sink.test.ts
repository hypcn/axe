import { HypertableSink, LogLevels } from "../../src";

describe("hypertable sink", () => {

  it("can be created", () => {
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    expect(sink.name).toBe(HypertableSink.name);
  });

  it("can be named", () => {
    const name = "Sink";
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
      name,
    });
    expect(sink.name).toBe(name);
  });

  it("has a default log filter", () => {
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    expect(sink.logFilter).toBeDefined();
  });

  it("can have a custom log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
      logFilter,
    });
    expect(sink.logFilter).toBe(logFilter);
  });

  it("can change log filter", () => {
    const logFilter = LogLevels.error;
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    sink.logFilter = logFilter;
    expect(sink.logFilter).toBe(logFilter);
  });

  it("logs handled messages to HypertaBLE", () => {
    return new Promise<void>((resolve, reject) => {
      
      const CONSOLE_LOG = global.console.log;
      global.console.log = (msg) => {
        global.console.log = CONSOLE_LOG;
        resolve();
      };
      
      const sink = new HypertableSink({
        apiKey,
        projectId,
        collectionId,
      });
      sink.handleMessage({
        context: "context",
        message: "log",
        level: LogLevels.log,
        timestamp: new Date(),
      });
      
    });
  });

});
