import { axeManager, AxeManager, CONSOLE_SINK, ConsoleSink } from "../src";

describe("manager", () => {

  it("exports a default instance", () => {
    expect(axeManager).toBeDefined();
  });

  it("has a ConsoleSink on the default manager instance", () => {
    expect(axeManager.findSink(ConsoleSink)).toBeDefined();
  });

  it("can be created", () => {
    const manager = new AxeManager({});
    expect(manager).toBeDefined();
  });

  it("can be created with a default ConsoleSink", () => {
    const manager = new AxeManager({
      withDefaultConsoleSink: true,
    });
    expect(manager.findSink(ConsoleSink)).toBeDefined();
  });

  it("has the correct default name for the default ConsoleSink", () => {
    const manager = new AxeManager({
      withDefaultConsoleSink: true,
    });
    expect(manager.findSink(ConsoleSink)!.name).toBe(CONSOLE_SINK);
  });

});