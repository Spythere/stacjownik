export default class StorageManager {
  static registerStorage(name: string) {
    window.localStorage.setItem(name, '1');
  }

  static unregisterStorage(name: string) {
    window.localStorage.removeItem(name);
  }

  static isRegistered(name: string) {
    return window.localStorage.getItem(name) ? true : false;
  }

  static setBooleanValue(key: string, val: boolean) {
    window.localStorage.setItem(key, val.toString());
  }

  static setNumericValue(key: string, val: number) {
    window.localStorage.setItem(key, val.toString());
  }

  static setStringValue(key: string, val: string) {
    window.localStorage.setItem(key, val);
  }

  static setValue(key: string, val: any) {
    if (typeof val == 'boolean') this.setBooleanValue(key, val);
    else if (typeof val == 'number') this.setNumericValue(key, val);
    else if (typeof val == 'string') this.setStringValue(key, val);
    else this.setStringValue(key, val);
  }

  static removeValue(key: string) {
    window.localStorage.removeItem(key);
  }

  static getValue(key: string) {
    return window.localStorage.getItem(key);
  }

  static getBooleanValue(key: string): boolean {
    return window.localStorage.getItem(key) === 'true' ? true : false;
  }

  static getStringValue(key: string): string {
    return window.localStorage.getItem(key) || '';
  }

  static getNumericValue(key: string): number {
    const itemValue = window.localStorage.getItem(key);
    return itemValue ? parseInt(itemValue) : 0;
  }
}
