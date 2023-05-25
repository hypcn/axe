import { HypertableSink, LogLevels } from "../../src";

const apiKey = "apiKey";
const projectId = "projectId";
const collectionId = "collectionId";

describe("hypertable sink", () => {

  it("can be created", () => {
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    expect(sink).toBeDefined();
    expect(sink.name).toBe(HypertableSink.name);
    expect(sink.logFilter).toBeDefined();
  });

  it("can have custom name and log filter", () => {
    const name = "Sink";
    const logFilter = LogLevels.error;
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
      name,
      logFilter,
    });
    expect(sink.name).toBe(name);
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

  // it("logs handled messages to Hypertable", () => {
  //   return new Promise<void>((resolve, reject) => {

  //     const CONSOLE_LOG = global.console.log;
  //     global.console.log = (msg) => {
  //       global.console.log = CONSOLE_LOG;
  //       resolve();
  //     };
      
  //     const sink = new HypertableSink({
  //       apiKey,
  //       projectId,
  //       collectionId,
  //     });
  //     sink.handleMessage({
  //       context: "context",
  //       message: "log",
  //       level: LogLevels.log,
  //       timestamp: new Date(),
  //     });
      
  //   });
  // });

});
