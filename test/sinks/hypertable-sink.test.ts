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
    expect(sink.minLevel).toBeDefined();
  });

  it("can have custom name and log filter", () => {
    const name = "Sink";
    const minLevel = LogLevels.error;
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
      name,
      minLevel,
    });
    expect(sink.name).toBe(name);
    expect(sink.minLevel).toBe(minLevel);
  });

  it("can change log filter", () => {
    const minLevel = LogLevels.error;
    const sink = new HypertableSink({
      apiKey,
      projectId,
      collectionId,
    });
    sink.minLevel = minLevel;
    expect(sink.minLevel).toBe(minLevel);
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
