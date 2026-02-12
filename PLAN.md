# Axe Logger - Code Review & Improvement Plan

**Date:** February 12, 2026

## Summary

Solid logging library with clean architecture and good core functionality. Main concerns: incomplete implementations, missing error handling, and some inconsistencies.

**Test Coverage:** Core is strong (Logger 96%, LogManager 100%, SinkFilter 96%), but sinks need work (WebhookSink 22%, WebsocketSink 22%, ObservableSink 25%, NestLogger 15%).

---

## Strengths

### Architecture

- ✅ Clean separation: `Logger`, `LogManager`, `LogSink` interfaces well-defined
- ✅ Flexible dual-level filtering (sink-level + logger-level overrides)
- ✅ Multiple manager support for isolated logging contexts
- ✅ Extensible plugin architecture via `LogSink` interface

### Code Quality

- ✅ Strong TypeScript usage with good type definitions
- ✅ Core functionality well-tested
- ✅ Clean, readable implementations
- ✅ Comprehensive README documentation

---

## Issues & Concerns

### 1. Incomplete Implementations

**Priority: HIGH** ✅ **COMPLETED**

- ~~`src/sinks/webhook-sink.ts` - `handleMessage()` throws "Method not implemented."~~
- ~~`src/sinks/websocket-sink.ts` - Stub implementation (22% coverage)~~
- **Completed:** Both sinks fully implemented with proper error handling and configuration options
  - WebhookSink: Sends logs to HTTP endpoints with customizable method, headers, and body builder
  - WebsocketSink: Real-time log streaming with reconnection logic, message queueing, and cross-platform support (browser/Node.js)

### 2. ConsoleSink Bug

**Priority: HIGH** ✅ **COMPLETED**

- ~~Constructor accepts `noColour`, `noTimestamp`, `noLevel`, `noContext` settings~~
- ~~These settings are **never used** in `handleMessage()` - always outputs everything with colors~~
- **Completed:** All constructor settings now properly implemented and respected in handleMessage()

### 3. Missing Error Handling

**Priority: HIGH** ✅ **COMPLETED**

- ~~No try-catch blocks in sink implementations~~
- ~~File write failures, network errors could crash the app~~
- ~~Logs could be silently dropped on errors~~
- **Completed:** Added comprehensive error handling to all sinks:
  - Optional `onError` callback parameter in all sink constructors
  - Try-catch blocks wrapping critical operations
  - Graceful fallback behavior (console.error) when onError not provided
  - File system errors, network errors, and stream errors properly handled

### 4. Type/Naming Inconsistency

**Priority: MEDIUM**

- `Logger` uses `logLevel: LogLevel | undefined`
- `LogSink` interface uses `logFilter: LogLevel`
- Mixed usage throughout codebase
- **Action:** Standardize on either "logLevel" or "logFilter"

### 5. FileSink Concerns

**Priority: MEDIUM**

- Stream readiness pattern could fail under high load
- No automatic rotation (only manual `openNewFile()`)
- No built-in file size limits
- No disk-full error handling
- **Action:** Add auto-rotation, size limits, better error handling

### 6. Dependencies

**Priority: LOW**

- `chalk` v4.1.2 and `node-fetch` v2.6.11 are older versions
- Consider updates (chalk v5 is ESM-only, may not be desirable)

---

## Improvement Suggestions

### High Priority

1. **Fix ConsoleSink** - Implement or remove unused constructor settings
2. **Complete/remove incomplete sinks** - WebhookSink, WebsocketSink need work
3. **Add error handling** - Wrap sink operations, add error events
4. **Standardize terminology** - Pick "logLevel" OR "logFilter" everywhere

### Medium Priority

5. **Async support** - Make LogSink interface async-capable for network/file operations
2. **File rotation** - Add automatic rotation by size/time in FileSink
3. **Performance** - Consider async queuing for high-throughput scenarios
4. **Increase test coverage** - Focus on sink implementations

### Low Priority

9. **Update dependencies** - Carefully evaluate chalk v5+ migration
2. **Batch operations** - WebhookSink could batch logs to reduce HTTP requests
3. **Structured logging** - Support JSON/structured log formats
4. **Export utility types** - Export `Class<T>` and other useful types

---

## Specific Code Issues

### src/sinks/console-sink.ts

- Lines 43-49: `handleMessage()` ignores `noColour`, `noTimestamp`, `noLevel`, `noContext` properties

### src/sinks/webhook-sink.ts

- Line 28: Throws "Method not implemented" - skeleton only

### src/sinks/websocket-sink.ts

- Incomplete implementation (22% test coverage)

### src/log-manager.ts

- Line 13: `typeof window === "undefined"` check good, but `process.env` access could fail in edge cases

### src/logger.ts

- Line 103: `inspect()` usage good, but consider adding depth limit option

### src/loggers/nest-logger.ts

- 15.78% test coverage - needs testing

---

## Recommended Next Steps

### Phase 1: Critical Fixes

1. Fix ConsoleSink settings implementation
2. Decide on WebhookSink/WebsocketSink (implement or remove)
3. Add basic error handling to all sinks
4. Add tests for error scenarios

### Phase 2: API Improvements

5. Add async/Promise support to LogSink interface
2. Standardize logLevel vs logFilter terminology
3. Add error event/callback system

### Phase 3: Enhanced Features

8. Implement automatic file rotation in FileSink
2. Add batch mode for WebhookSink
3. Improve performance for high-throughput scenarios
4. Add structured logging support

### Phase 4: Polish

12. Increase test coverage (target 90%+)
2. Add integration tests for NestLogger
3. Update dependencies if needed
4. Add performance benchmarks
