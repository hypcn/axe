import { LogLevel, LogLevelNumber } from "./interfaces/log-level.interface";

/**
 * Define log sink filters by log level, to control which messages can be
 * handled by which sinks
 */
export class SinkFilter {

  private filter = new Map<string, LogLevel>();

  /**
   * A minimum log level applied to all sinks, whether or not they are explicitly set
   * in this filter
   */
  all: LogLevel | undefined = undefined;

  private maxFilterLevel(a: LogLevel | undefined, b: LogLevel | undefined): LogLevel | undefined {
    if (!a && !b) return undefined;
    if (a && !b) return a;
    if (!a && b) return b;
    return (LogLevelNumber[a!] <= LogLevelNumber[b!]) ? a : b;
  }

  /**
   * Read all the defined filters as an object. Will be empty if no filters have been set.
   * @returns 
   */
  read(): { [sinkName: string]: LogLevel } {
    const keys = new Array(...this.filter.keys());
    const filters: { [sinkName: string]: LogLevel } = {};

    for (const key of keys) {
      filters[key] = this.filter.get(key)!;
    }
    if (this.all !== undefined) {
      filters["_all"] = this.all;
    }

    return filters;
  }

  /**
   * Get the log level filter value for the given sink name, if one is defined
   * @param sinkName 
   * @returns 
   */
  get(sinkName: string) {
    return this.maxFilterLevel(this.all, this.filter.get(sinkName));
  }

  /**
   * Set the log filter level for the specified sink name
   * @param sinkName 
   * @param logLevel 
   */
  set(sinkName: string, logLevel: LogLevel) {
    this.filter.set(sinkName, logLevel);
  }

  /**
   * Remove the filter for the specified sink name
   * @param sinkName 
   */
  remove(sinkName: string) {
    this.filter.delete(sinkName);
  }

  /**
   * Clear all defined filters
   */
  clear() {
    this.filter.clear();
  }

}
