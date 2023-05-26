import { LogLevels, SinkFilter } from "../src";

describe("sink filter", () => {

  it("can set filters", () => {
    const sinkFilter = new SinkFilter();

    const sink = "sink";
    sinkFilter.set(sink, LogLevels.log);

    expect(sinkFilter.get(sink)).toBe(LogLevels.log);
  });

  it("can read filters", () => {
    const sinkFilter = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sinkFilter.set(sink1, LogLevels.log);
    sinkFilter.set(sink2, LogLevels.error);

    expect(sinkFilter.read()).toMatchObject({
      [sink1]: LogLevels.log,
      [sink2]: LogLevels.error,
    });
  });

  it("can remove filters", () => {
    const sinkFilter = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sinkFilter.set(sink1, LogLevels.log);
    sinkFilter.set(sink2, LogLevels.error);
    sinkFilter.remove(sink1);

    expect(sinkFilter.read()).toMatchObject({
      [sink2]: LogLevels.error,
    });
  });

  it("can clear filters", () => {
    const sinkFilter = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sinkFilter.set(sink1, LogLevels.log);
    sinkFilter.set(sink2, LogLevels.error);
    sinkFilter.clear;

    expect(sinkFilter.read()).toMatchObject({ });
  });

  it("can set a minimum filter level for all sinks", () => {
    const sinkFilter = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sinkFilter.set(sink1, LogLevels.log);
    sinkFilter.set(sink2, LogLevels.error);
    sinkFilter.all = LogLevels.warn;

    expect(sinkFilter.get(sink1)).toBe(LogLevels.warn);
    expect(sinkFilter.get(sink2)).toBe(LogLevels.error);
    expect(sinkFilter.get("unknown")).toBe(LogLevels.warn);
  });

});
