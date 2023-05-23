import { LogLevel } from "./log-level.interface";

/**
 * Define log transport filters by log level, to control which messages can be
 * handled by which transports
 */
export class TransportFilter {

  private filter = new Map<string, LogLevel>();

  /**
   * Read all the defined filters as an object. Will be empty if no filters have been set.
   * @returns 
   */
  read(): { [transportName: string]: LogLevel } {
    const keys = new Array(...this.filter.keys());
    const filters: { [transportName: string]: LogLevel } = {};
    for (const key of keys) {
      filters[key] = this.filter.get(key)!;
    }
    return filters;
  }

  /**
   * Get the log level filter value for the given transport name, if one is defined
   * @param transportName 
   * @returns 
   */
  get(transportName: string) {
    return this.filter.get(transportName);
  }

  /**
   * Set the log filter level for the specified transport name
   * @param transportName 
   * @param logLevel 
   */
  set(transportName: string, logLevel: LogLevel) {
    this.filter.set(transportName, logLevel);
  }

  /**
   * Remove the filter for the specified transport name
   * @param transportName 
   */
  remove(transportName: string) {
    this.filter.delete(transportName);
  }

  /**
   * Clear all defined filters
   */
  clear() {
    this.filter.clear();
  }

}
