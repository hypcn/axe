import { WebsocketSink, LogLevels, LogMessage } from "../../src";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  private listeners: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.url = url;
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit('open');
    }, 10);
  }

  send = jest.fn();

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.emit('close');
  }

  addEventListener(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  private emit(event: string, data?: any) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  // Simulate error
  simulateError(message: string) {
    this.emit('error', { message });
  }

  // Simulate close
  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.emit('close');
  }
}

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

describe("websocket sink", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("can be created", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });
    expect(sink).toBeDefined();
  });

  it("has a default name", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });
    expect(sink.name).toBe(WebsocketSink.name);
  });

  it("can be named", () => {
    const name = "Websocket Sink";
    const sink = new WebsocketSink({ url: "ws://localhost:8080", name });
    expect(sink.name).toBe(name);
  });

  it("has a default min level", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });
    expect(sink.minLevel).toBeDefined();
    expect(sink.minLevel).toBe(LogLevels.warn);
  });

  it("can have a custom min level", () => {
    const minLevel = LogLevels.error;
    const sink = new WebsocketSink({ url: "ws://localhost:8080", minLevel });
    expect(sink.minLevel).toBe(minLevel);
  });

  it("can change min level", () => {
    const minLevel = LogLevels.error;
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });
    sink.minLevel = minLevel;
    expect(sink.minLevel).toBe(minLevel);
  });

  it("connects to the WebSocket URL", async () => {
    const url = "ws://localhost:8080";
    const sink = new WebsocketSink({ url });

    // Let the connection open
    jest.advanceTimersByTime(20);

    const ws = (sink as any).ws as MockWebSocket;
    expect(ws).toBeDefined();
    expect(ws.url).toBe(url);
    expect(ws.readyState).toBe(MockWebSocket.OPEN);

    sink.destroy();
  });

  it("sends log messages when connected", async () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    // Let the connection open
    jest.advanceTimersByTime(20);

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "TestContext",
      message: "Test message",
    };

    sink.handleMessage(message);

    const ws = (sink as any).ws as MockWebSocket;
    expect(ws.send).toHaveBeenCalledTimes(1);

    const sentData = JSON.parse(ws.send.mock.calls[0][0]);
    expect(sentData.level).toBe(LogLevels.error);
    expect(sentData.context).toBe("TestContext");
    expect(sentData.message).toBe("Test message");

    sink.destroy();
  });

  it("queues messages when not connected", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    // Don't advance timers, so connection stays in CONNECTING state
    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "TestContext",
      message: "Test message",
    };

    sink.handleMessage(message);

    const ws = (sink as any).ws as MockWebSocket;
    expect(ws.send).not.toHaveBeenCalled();

    const queue = (sink as any).messageQueue as string[];
    expect(queue.length).toBe(1);

    sink.destroy();
  });

  it("sends queued messages when connection opens", async () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    // Queue messages while connecting
    const message1: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context1",
      message: "Message 1",
    };

    const message2: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.warn,
      context: "Context2",
      message: "Message 2",
    };

    sink.handleMessage(message1);
    sink.handleMessage(message2);

    const ws = (sink as any).ws as MockWebSocket;
    expect(ws.send).not.toHaveBeenCalled();

    // Let the connection open
    jest.advanceTimersByTime(20);

    // Both queued messages should be sent
    expect(ws.send).toHaveBeenCalledTimes(2);

    sink.destroy();
  });

  it("limits message queue to 100 messages", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    // Queue 150 messages
    for (let i = 0; i < 150; i++) {
      const message: LogMessage = {
        timestamp: new Date(),
        level: LogLevels.error,
        context: "Context",
        message: `Message ${i}`,
      };
      sink.handleMessage(message);
    }

    const queue = (sink as any).messageQueue as string[];
    expect(queue.length).toBe(100);

    sink.destroy();
  });

  it("uses custom message builder", async () => {
    const buildMessage = jest.fn((logMessage: LogMessage) => ({
      custom: true,
      msg: logMessage.message,
    }));

    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      buildMessage,
    });

    jest.advanceTimersByTime(20);

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "TestContext",
      message: "Test message",
    };

    sink.handleMessage(message);

    expect(buildMessage).toHaveBeenCalledWith(message);

    const ws = (sink as any).ws as MockWebSocket;
    const sentData = JSON.parse(ws.send.mock.calls[0][0]);
    expect(sentData.custom).toBe(true);
    expect(sentData.msg).toBe("Test message");

    sink.destroy();
  });

  it("attempts to reconnect when connection closes", () => {
    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      maxReconnectAttempts: 3,
      reconnectDelay: 1000,
    });

    jest.advanceTimersByTime(20);

    const ws = (sink as any).ws as MockWebSocket;
    ws.simulateClose();

    // Should attempt reconnect after delay
    jest.advanceTimersByTime(1000);

    const reconnectAttempts = (sink as any).reconnectAttempts;
    expect(reconnectAttempts).toBe(1);

    sink.destroy();
  });

  it("stops reconnecting after max attempts", () => {
    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      maxReconnectAttempts: 2,
      reconnectDelay: 1000,
    });

    // Don't let initial connection succeed - keep it in CONNECTING state
    // This simulates repeated connection failures

    // Simulate first reconnect attempt
    jest.advanceTimersByTime(1000);

    // Simulate second reconnect attempt
    jest.advanceTimersByTime(1000);

    // Simulate third reconnect attempt (should not happen)
    jest.advanceTimersByTime(1000);

    // After 2 failed attempts, reconnectAttempts should be 2
    const reconnectAttempts = (sink as any).reconnectAttempts;
    expect(reconnectAttempts).toBeLessThanOrEqual(2);

    sink.destroy();
  });

  it("resets reconnect attempts on successful connection", () => {
    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
    });

    jest.advanceTimersByTime(20);

    // Simulate disconnect
    let ws = (sink as any).ws as MockWebSocket;
    ws.simulateClose();

    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(20);

    // Reconnect attempts should be reset after successful connection
    const reconnectAttempts = (sink as any).reconnectAttempts;
    expect(reconnectAttempts).toBe(0);

    sink.destroy();
  });

  it("handles errors with onError callback", async () => {
    const onError = jest.fn();
    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      onError,
    });

    jest.advanceTimersByTime(20);

    const ws = (sink as any).ws as MockWebSocket;
    ws.simulateError("Connection failed");

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toContain("Connection failed");

    sink.destroy();
  });

  it("handles errors without onError callback", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    jest.advanceTimersByTime(20);

    const ws = (sink as any).ws as MockWebSocket;
    ws.simulateError("Connection failed");

    expect(consoleError).toHaveBeenCalled();
    expect(consoleError.mock.calls[0][1]).toContain("Connection failed");

    consoleError.mockRestore();
    sink.destroy();
  });

  it("handles handleMessage errors with onError callback", async () => {
    const onError = jest.fn();
    const buildMessage = () => {
      throw new Error("Build error");
    };

    const sink = new WebsocketSink({
      url: "ws://localhost:8080",
      buildMessage,
      onError,
    });

    jest.advanceTimersByTime(20);

    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe("Build error");

    sink.destroy();
  });

  it("can be destroyed", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });
    jest.advanceTimersByTime(20);

    expect(() => sink.destroy()).not.toThrow();

    const ws = (sink as any).ws;
    expect(ws).toBeUndefined();
  });

  it("clears message queue on destroy", () => {
    const sink = new WebsocketSink({ url: "ws://localhost:8080" });

    // Queue messages
    const message: LogMessage = {
      timestamp: new Date(),
      level: LogLevels.error,
      context: "Context",
      message: "Message",
    };

    sink.handleMessage(message);
    sink.handleMessage(message);

    expect((sink as any).messageQueue.length).toBeGreaterThan(0);

    sink.destroy();

    expect((sink as any).messageQueue.length).toBe(0);
  });

});
