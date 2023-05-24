import { Logger } from "../src";

describe("logger", () => {

  it("can be created", () => {
    expect(new Logger()).toBeDefined();
  });

  it("has a context", () => {
    const ctx = "My Context";
    const logger = new Logger(ctx);
    expect(logger.context).toBe(ctx);
  });

});
