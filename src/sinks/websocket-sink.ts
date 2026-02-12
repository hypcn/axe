import { LogLevel, LogLevels, LogMessage, LogSink } from "../interfaces";

// WebSocket type that works in both Node.js and browser
type WebSocketLike = {
  send(data: string): void;
  close(): void;
  readyState: number;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
  addEventListener?(event: string, handler: (event?: any) => void): void;
  on?(event: string, handler: (event?: any) => void): void;
};

export class WebsocketSink implements LogSink {

  name: string = this.constructor.name;
  logFilter: LogLevel = LogLevels.warn;

  private url: string;
  private ws: WebSocketLike | undefined;
  private buildMessage: (logMessage: LogMessage) => object;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private messageQueue: string[] = [];
  private onError?: (error: Error) => void;

  constructor(settings: {
    name?: string,
    logFilter?: LogLevel,

    /** The WebSocket URL to connect to (ws:// or wss://) */
    url: string,
    /** Optionally override the function building the message */
    buildMessage?: (logMessage: LogMessage) => object,
    /** Maximum number of reconnection attempts. Set to 0 to disable reconnection */
    maxReconnectAttempts?: number,
    /** Delay in milliseconds between reconnection attempts */
    reconnectDelay?: number,
    /** Optional error handler */
    onError?: (error: Error) => void,
  }) {
    if (settings.name) this.name = settings.name;
    if (settings.logFilter) this.logFilter = settings.logFilter;

    this.url = settings.url;
    this.buildMessage = settings.buildMessage ?? this.defaultBuildMessage;
    this.maxReconnectAttempts = settings.maxReconnectAttempts ?? 5;
    this.reconnectDelay = settings.reconnectDelay ?? 1000;
    this.onError = settings.onError;

    this.connect();
  }

  private defaultBuildMessage(logMessage: LogMessage): object {
    return {
      level: logMessage.level,
      context: logMessage.context,
      message: logMessage.message,
      timestamp: logMessage.timestamp.toISOString(),
      deviceId: logMessage.deviceId,
      deviceName: logMessage.deviceName,
      processId: logMessage.processId,
    };
  }

  private connect() {
    try {
      // Try to use native WebSocket (browser) or require 'ws' (Node.js)
      let WebSocketConstructor: any;
      
      if (typeof WebSocket !== 'undefined') {
        // Browser environment
        WebSocketConstructor = WebSocket;
      } else {
        // Node.js environment - try to require 'ws'
        try {
          WebSocketConstructor = require('ws');
        } catch (e) {
          const error = new Error(`WebsocketSink requires 'ws' package in Node.js. Install it with: npm install ws`);
          if (this.onError) {
            this.onError(error);
          } else {
            console.error(error.message);
          }
          return;
        }
      }

      this.ws = new WebSocketConstructor(this.url) as WebSocketLike;

      this.ws.addEventListener?.('open', () => {
        this.reconnectAttempts = 0;
        // Send any queued messages
        while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === this.ws.OPEN) {
          const msg = this.messageQueue.shift();
          if (msg && this.ws) this.ws.send(msg);
        }
      });

      this.ws.addEventListener?.('error', (event: any) => {
        const error = new Error(`WebSocket error: ${event.message || 'Unknown error'}`);
        if (this.onError) {
          this.onError(error);
        } else {
          console.error(`WebsocketSink error for ${this.name}:`, error.message);
        }
      });

      this.ws.addEventListener?.('close', () => {
        this.attemptReconnect();
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) {
        this.onError(err);
      } else {
        console.error(`WebsocketSink connection error for ${this.name}:`, err.message);
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }

  handleMessage(logMessage: LogMessage) {
    try {
      const messageObj = this.buildMessage(logMessage);
      const messageStr = JSON.stringify(messageObj);

      if (this.ws && this.ws.readyState === this.ws.OPEN) {
        this.ws.send(messageStr);
      } else {
        // Queue message if not connected (up to 100 messages)
        if (this.messageQueue.length < 100) {
          this.messageQueue.push(messageStr);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) {
        this.onError(err);
      } else {
        console.error(`WebsocketSink handleMessage error for ${this.name}:`, err.message);
      }
    }
  }

  destroy() {
    this.messageQueue = [];
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.close();
    }
    this.ws = undefined;
  }

}
