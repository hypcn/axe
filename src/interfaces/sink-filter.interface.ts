import { LogLevel } from "./log-level.interface";

/**
 * Define log sink filters by log level, to control which messages can be
 * handled by which sinks
 */
export class SinkFilter {

  private filter = new Map<string, LogLevel>();

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
    return filters;
  }

  /**
   * Get the log level filter value for the given sink name, if one is defined
   * @param sinkName 
   * @returns 
   */
  get(sinkName: string) {
    return this.filter.get(sinkName);
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
