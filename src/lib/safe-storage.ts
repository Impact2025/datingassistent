/**
 * Safe localStorage wrapper met fallback voor SecurityErrors
 */

class SafeStorage {
  private isAvailable: boolean;
  private memoryFallback: Map<string, string>;

  constructor() {
    this.memoryFallback = new Map();
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available, using memory fallback');
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isAvailable) {
        return localStorage.getItem(key);
      }
      return this.memoryFallback.get(key) || null;
    } catch (e) {
      return this.memoryFallback.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.isAvailable) {
        localStorage.setItem(key, value);
      }
      this.memoryFallback.set(key, value);
    } catch (e) {
      this.memoryFallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch (e) {
      this.memoryFallback.delete(key);
    }
  }

  clear(): void {
    try {
      if (this.isAvailable) {
        localStorage.clear();
      }
      this.memoryFallback.clear();
    } catch (e) {
      this.memoryFallback.clear();
    }
  }
}

export const safeStorage = new SafeStorage();
