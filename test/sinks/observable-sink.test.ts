import { ObservableSink, LogLevels, LogMessage } from "../../src";

describe("observable sink", () => {

  it("can be created", () => {
    const sink = new ObservableSink({});
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new ObservableSink({});
    expect(sink.name).toBe(ObservableSink.name);
  });

  it("can be named", () => {
    const name = "Observable Sink";
    const sink = new ObservableSink({ name });
    expect(sink.name).toBe(name);
  });

  it("has a default min level", () => {
    const sink = new ObservableSink({});
    expect(sink.minLevel).toBeDefined();
    expect(sink.minLevel).toBe(LogLevels.debug);
  });

  it("can have a custom min level", () => {
    const minLevel = LogLevels.error;
    const sink = new ObservableSink({ minLevel });
    expect(sink.minLevel).toBe(minLevel);
  });

  it("can change min level", () => {
    const minLevel = LogLevels.error;
    const sink = new ObservableSink({});
    sink.minLevel = minLevel;
    expect(sink.minLevel).toBe(minLevel);
  });

  it("exposes a logMessage$ observable", () => {
    const sink = new ObservableSink({});
    expect(sink.logMessage$).toBeDefined();
    expect(typeof sink.logMessage$.subscribe).toBe("function");
  });

  it("emits log messages to the observable", (done) => {
    const sink = new ObservableSink({});

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "TestContext",
      message: "Test message",
    };

    sink.logMessage$.subscribe((msg) => {
      expect(msg).toBe(message);
      expect(msg.level).toBe(LogLevels.error);
      expect(msg.context).toBe("TestContext");
      expect(msg.message).toBe("Test message");
      done();
    });

    sink.handleMessage(message);
  });

  it("emits multiple log messages", (done) => {
    const sink = new ObservableSink({});

    const messages: LogMessage[] = [
      {
        timestamp: new Date(),
        level: LogLevels.error,
        context: "Context1",
        message: "Message 1",
      },
      {
        timestamp: new Date(),
        level: LogLevels.warn,
        context: "Context2",
        message: "Message 2",
      },
      {
        timestamp: new Date(),
        level: LogLevels.log,
        context: "Context3",
        message: "Message 3",
      },
    ];

    const received: LogMessage[] = [];

    sink.logMessage$.subscribe((msg) => {
      received.push(msg);
      if (received.length === 3) {
        expect(received).toEqual(messages);
        done();
      }
    });

    messages.forEach(msg => sink.handleMessage(msg));
  });

  it("handles errors with onError callback", () => {
    const onError = jest.fn();
    const sink = new ObservableSink({ onError });

    // Force an error by making the subject throw
    const originalNext = (sink as any)._logMessage.next;
    (sink as any)._logMessage.next = () => {
      throw new Error("Test error");
    };

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe("Test error");

    // Restore
    (sink as any)._logMessage.next = originalNext;
  });

  it("handles errors without onError callback", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const sink = new ObservableSink({});

    // Force an error by making the subject throw
    const originalNext = (sink as any)._logMessage.next;
    (sink as any)._logMessage.next = () => {
      throw new Error("Test error");
    };

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);

    expect(consoleError).toHaveBeenCalled();
    expect(consoleError.mock.calls[0][0]).toContain("ObservableSink error");

    consoleError.mockRestore();
    (sink as any)._logMessage.next = originalNext;
  });

  it("can be destroyed", () => {
    const sink = new ObservableSink({});
    expect(() => sink.destroy()).not.toThrow();
  });

});
