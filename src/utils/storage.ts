import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({
  id: 'softiel-storage',
  encryptionKey: 'softiel-encryption-key', // Production'da daha güvenli bir key kullanın
});

export const Storage = {
  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  get: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },

  delete: (key: string): void => {
    storage.delete(key);
  },

  clear: (): void => {
    storage.clearAll();
  },

  contains: (key: string): boolean => {
    return storage.contains(key);
  },
};

