import { WebhookSink, LogLevels, LogMessage } from "../../src";
import fetch from "node-fetch";

jest.mock("node-fetch");
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("webhook sink", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can be created", () => {
    const sink = new WebhookSink({ url: "https://example.com/webhook" });
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new WebhookSink({ url: "https://example.com/webhook" });
    expect(sink.name).toBe(WebhookSink.name);
  });

  it("can be named", () => {
    const name = "Webhook Sink";
    const sink = new WebhookSink({ url: "https://example.com/webhook", name });
    expect(sink.name).toBe(name);
  });

  it("has a default min level", () => {
    const sink = new WebhookSink({ url: "https://example.com/webhook" });
    expect(sink.minLevel).toBeDefined();
    expect(sink.minLevel).toBe(LogLevels.warn);
  });

  it("can have a custom min level", () => {
    const minLevel = LogLevels.error;
    const sink = new WebhookSink({ url: "https://example.com/webhook", minLevel });
    expect(sink.minLevel).toBe(minLevel);
  });

  it("can change min level", () => {
    const minLevel = LogLevels.error;
    const sink = new WebhookSink({ url: "https://example.com/webhook" });
    sink.minLevel = minLevel;
    expect(sink.minLevel).toBe(minLevel);
  });

  it("sends log messages to webhook with default body", async () => {
    mockedFetch.mockResolvedValueOnce({} as any);

    const sink = new WebhookSink({ url: "https://example.com/webhook" });

    const message: LogMessage = {
      timestamp: new Date("2023-01-01T12:00:00Z"),
      level: LogLevels.error,
      context: "TestContext",
      message: "Test message",
      deviceId: "device-123",
      deviceName: "TestDevice",
      processId: "1234",
    };

    sink.handleMessage(message);

    // Wait for async fetch to be called
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          level: "error",
          context: "TestContext",
          message: "Test message",
          timestamp: "2023-01-01T12:00:00.000Z",
          deviceId: "device-123",
          deviceName: "TestDevice",
          processId: "1234",
        }),
      })
    );
  });

  it("supports custom HTTP method", async () => {
    mockedFetch.mockResolvedValueOnce({} as any);

    const sink = new WebhookSink({ 
      url: "https://example.com/webhook",
      method: "PUT"
    });

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.warn,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "PUT",
      })
    );
  });

  it("supports custom headers", async () => {
    mockedFetch.mockResolvedValueOnce({} as any);

    const customHeaders = {
      "Authorization": "Bearer token123",
      "X-Custom-Header": "custom-value",
    };

    const sink = new WebhookSink({ 
      url: "https://example.com/webhook",
      headers: customHeaders,
    });

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        headers: expect.objectContaining(customHeaders),
      })
    );
  });

  it("supports custom body builder", async () => {
    mockedFetch.mockResolvedValueOnce({} as any);

    const customBuildBody = jest.fn((msg: LogMessage) => ({
      customField: msg.message,
      severity: msg.level,
    }));

    const sink = new WebhookSink({ 
      url: "https://example.com/webhook",
      buildBody: customBuildBody,
    });

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Test",
    };

    sink.handleMessage(message);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(customBuildBody).toHaveBeenCalledWith(message);
    expect(mockedFetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        body: JSON.stringify({
          customField: "Test",
          severity: "error",
        }),
      })
    );
  });

  it("handles fetch errors with onError callback", async () => {
    const error = new Error("Network error");
    mockedFetch.mockRejectedValueOnce(error);

    const onError = jest.fn();
    const sink = new WebhookSink({ 
      url: "https://example.com/webhook",
      onError,
    });

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("handles fetch errors without onError callback", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedFetch.mockRejectedValueOnce(new Error("Network error"));

    const sink = new WebhookSink({ url: "https://example.com/webhook" });

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(consoleError).toHaveBeenCalled();
    expect(consoleError.mock.calls[0][0]).toContain("WebhookSink error");

    consoleError.mockRestore();
  });

  it("can be destroyed", () => {
    const sink = new WebhookSink({ url: "https://example.com/webhook" });
    expect(() => sink.destroy()).not.toThrow();
  });

});
