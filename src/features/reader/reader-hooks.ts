import { useEffect, useState } from 'react';
import { readStoredValue, writeStoredValue } from '../../services/storage-service';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue));

  useEffect(() => {
    writeStoredValue(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
