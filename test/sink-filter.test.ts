import { LogLevels, SinkFilter } from "../src";

describe("sink filter", () => {

  it("can set filters", () => {
    const sf = new SinkFilter();

    const sink = "sink";
    sf.set(sink, LogLevels.log);

    expect(sf.get(sink)).toBe(LogLevels.log);
  });

  it("can read filters", () => {
    const sf = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sf.set(sink1, LogLevels.log);
    sf.set(sink2, LogLevels.error);

    expect(sf.read()).toMatchObject({
      [sink1]: LogLevels.log,
      [sink2]: LogLevels.error,
    });
  });

  it("can remove filters", () => {
    const sf = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sf.set(sink1, LogLevels.log);
    sf.set(sink2, LogLevels.error);
    sf.remove(sink1);

    expect(sf.read()).toMatchObject({
      [sink2]: LogLevels.error,
    });
  });

  it("can clear filters", () => {
    const sf = new SinkFilter();

    const sink1 = "sink1";
    const sink2 = "sink2";
    sf.set(sink1, LogLevels.log);
    sf.set(sink2, LogLevels.error);
    sf.clear;

    expect(sf.read()).toMatchObject({ });
  });

});
